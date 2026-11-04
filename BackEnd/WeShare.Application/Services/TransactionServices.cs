using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Dtos.Transaction;
using WeShare.Application.Dtos.TransactionSplit;
using WeShare.Application.Dtos.User;
using WeShare.Application.Helpers;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace WeShare.Application.Services
{
    public class TransactionServices : ITransactionServices
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly ITransactionSplitRepository _transactionSplitRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGroupMemberRepository _groupMemberRepository;
        private readonly IGroupDebtRepository _groupDebtRepository;

        public TransactionServices(ITransactionRepository transactionRepository, ITransactionSplitRepository transactionSplitRepository, IMapper mapper, IUnitOfWork unitOfWork
            , IGroupMemberRepository groupMemberRepository, IGroupDebtRepository groupDebtRepository)
        {
            _transactionRepository = transactionRepository;
            _transactionSplitRepository = transactionSplitRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _groupMemberRepository = groupMemberRepository;
            _groupDebtRepository = groupDebtRepository;
        }
        public async Task<TransactionViewDto> CreateTransactionAsync(int userId, CreateTransactionDto data)
        {
            if (userId != data.PayerId)
            {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            var newTransaction = new Core.Entities.Transaction
            {
                GroupId = data.GroupId,
                PayerId = data.PayerId,
                Amount = data.Amount,
                Description = data.Description,
                CreatedAt = DateTime.UtcNow,
                SplitStrategy = data.Strategy,
                Type = data.Type,
                ProofUrl = data.ReceiptUrl
            };
            if (data.TaskId.HasValue)
            {
                newTransaction.TaskId = data.TaskId.Value;
            }
            await _transactionRepository.AddAsync(newTransaction);
            var payerMember = await _groupMemberRepository.GetGroupMemberAsync(data.PayerId, data.GroupId);
            if (payerMember is null)
            {
                throw new InternalServerError(ErrorMessage.GROUP_NOT_FOUND);
            }
            payerMember.Balance += data.Amount;
            var newTransactionSplits = new Dictionary<int, decimal>();
            //if (data.Strategy != Core.Enums.SplitStrategyEnum.EQUALLY)
            //{
            //    newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(data.Amount, data.DebtIds, data.Strategy, data.SplitAmounts);
            //}
            //else
            //{
            //    newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(data.Amount, data.DebtIds, data.Strategy, data.SplitAmounts);
            //}

            newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(data.Amount, data.DebtIds, data.Strategy, data.SplitAmounts);

            var notiRepo = _unitOfWork.Repository<Notification>();

            foreach (var split in newTransactionSplits)
            {
                var transactionSplit = new TransactionSplit
                {
                    Transaction = newTransaction,
                    DebtorId = split.Key,
                    OwedAmount = split.Value
                };
                await _groupMemberRepository.UpdateBalanceAsync(data.GroupId, split.Key, -split.Value);
                await _transactionSplitRepository.CreateTransactionSplitAsync(transactionSplit);
                if (split.Key != data.PayerId) await _groupDebtRepository.SyncGroupDebtAsync(data.GroupId, split.Key, data.PayerId, split.Value);
                var newNoti = new Notification
                {
                    ReceiveId = split.Key,
                    Title = "New Transaction Created",
                    Message = $"A new transaction has been created in group {data.GroupId} by user {data.PayerId}. You owe {split.Value}.",
                    IsRead = false,
                    Type = Core.Enums.NotificationTypeEnum.PAYMENT,
                    RelatedTransactionId = newTransaction.Id,
                    RelatedGroupId = data.GroupId,
                    CreatedAt = DateTime.UtcNow
                };
                await notiRepo.AddAsync(newNoti);
            }
            await _unitOfWork.CompleteAsync();

            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(newTransaction.PayerId);
            if (user == null)
            {
                throw new NotFoundException(ErrorMessage.PAYER_NOT_FOUND);
            }
            var task = null as Core.Entities.Task;
            if (data.TaskId.HasValue && data.TaskId != 0)
            {
                task = await _unitOfWork.Repository<Core.Entities.Task>().GetByIdAsync(data.TaskId.Value);
            }
            var res = new TransactionViewDto
            {
                Id = newTransaction.Id,
                GroupId = newTransaction.GroupId,
                Payer = _mapper.Map<UserViewDto>(user),
                Amount = newTransaction.Amount,
                Description = newTransaction.Description,
                Task = newTransaction.TaskId.HasValue ? _mapper.Map<TaskViewDto>(task) : null,
                CreatedAt = newTransaction.CreatedAt,
                SplitStrategy = newTransaction.SplitStrategy,
                TransactionSplits = _mapper.Map<IEnumerable<TransactionSplitViewDto>>(newTransaction.TransactionSplits)
            };
            return res;
        }
        public async Task<bool> IsUserPayerOfTransactionAsync(int userId, int transactionId)
        {
            var transaction = await _transactionRepository.GetByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new NotFoundException(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            return transaction.PayerId == userId;
        }
        public async Task<TransactionViewDto> UpdateTransactionAsync(int userId, UpdateTransactionDto data)
        {
            var transaction = await _transactionRepository.GetTransactionDetailsAsync(data.Id);
            if (transaction == null)
            {
                throw new NotFoundException(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            if (transaction.PayerId != userId)
            {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            if (transaction.Status == Core.Enums.TransactionStatusEnum.PENDING)
            {
                throw new InternalServerError(ErrorMessage.TRANSACTION_IS_PENDING);
            }
            transaction.Description = data.Description;
            var debtIds = new List<int>();
            if (data.SplitAmounts != null) debtIds.AddRange(data.SplitAmounts.Keys);
            else debtIds = transaction.TransactionSplits.Select(ts => ts.DebtorId).ToList();
            debtIds = debtIds.Distinct().ToList();
            if (data.Amount.HasValue)
            {
                // revert
                var oldTransactionSplits = transaction.TransactionSplits.ToList();
                var groupMembers = await _groupMemberRepository.GetAsync(transaction.GroupId);
                foreach (var item in groupMembers)
                {
                    var tmp = oldTransactionSplits.FirstOrDefault(ts => ts.DebtorId == item.UserId);
                    if (tmp is null) continue;
                    await _groupMemberRepository.RevertTransactionAsync(item, tmp.OwedAmount);
                }
                var payerGroupMember = await _groupMemberRepository.GetGroupMemberAsync(transaction.PayerId, transaction.GroupId);
                if (payerGroupMember is null)
                {
                    throw new NotFoundException(ErrorMessage.GROUP_MEMBER_NOT_FOUND);
                }
                await _groupMemberRepository.RevertTransactionAsync(payerGroupMember, -transaction.Amount);
                foreach (var item in oldTransactionSplits)
                {
                    if (item.DebtorId != transaction.PayerId) await _groupDebtRepository.SyncGroupDebtAsync(transaction.GroupId, item.DebtorId, item.Transaction.PayerId, -item.OwedAmount);
                }
                await _transactionSplitRepository.DeleteTransactionAsync(transaction.Id);

                // update new
                transaction.Amount = data.Amount.Value;
                var newTransactionSplits = new Dictionary<int, decimal>();
                newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(transaction.Amount, debtIds, data.Strategy, data.SplitAmounts);
                payerGroupMember.Balance += transaction.Amount;
                foreach (var split in newTransactionSplits)
                {
                    var transactionSplit = new TransactionSplit
                    {
                        Transaction = transaction,
                        DebtorId = split.Key,
                        OwedAmount = split.Value
                    };
                    await _groupMemberRepository.UpdateBalanceAsync(transaction.GroupId, split.Key, -split.Value);
                    await _transactionSplitRepository.CreateTransactionSplitAsync(transactionSplit);
                    if (split.Key != transaction.PayerId) await _groupDebtRepository.SyncGroupDebtAsync(transaction.GroupId, split.Key, transaction.PayerId, split.Value);
                }
            }
            _transactionRepository.Update(transaction);
            await _unitOfWork.CompleteAsync();
            return await GetTransactionDetailsAsync(data.Id);
        }
        public async Task<TransactionViewDto> GetTransactionDetailsAsync(int transactionId)
        {
            var transaction = await _transactionRepository.GetByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new NotFoundException(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            var payer = await _unitOfWork.Repository<User>().GetByIdAsync(transaction.PayerId);
            if (payer == null)
            {
                throw new NotFoundException(ErrorMessage.PAYER_NOT_FOUND);
            }
            var task = null as Core.Entities.Task;
            if (transaction.TaskId.HasValue && transaction.TaskId != 0)
            {
                task = await _unitOfWork.Repository<Core.Entities.Task>().GetByIdAsync(transaction.TaskId.Value);
            }
            var res = new TransactionViewDto
            {
                Id = transaction.Id,
                GroupId = transaction.GroupId,
                Payer = _mapper.Map<UserViewDto>(payer),
                Amount = transaction.Amount,
                Description = transaction.Description,
                Task = transaction.TaskId.HasValue ? _mapper.Map<TaskViewDto>(task) : null,
                CreatedAt = transaction.CreatedAt,
                SplitStrategy = transaction.SplitStrategy,
                TransactionSplits = _mapper.Map<IEnumerable<TransactionSplitViewDto>>(transaction.TransactionSplits)
            };
            return res;
        }
        public async Task<PageResultDto<TransactionViewDto>> GetTransactionsByGroupIdAsync(int groupId, int pageSize, int pageIndex)
        {
            var transactions = await _transactionRepository.GetTransactionsByGroupIdAsync(groupId, pageSize, pageIndex);
            var transactionViewDtos = new List<TransactionViewDto>();
            foreach (var transaction in transactions.Items)
            {
                var payer = await _unitOfWork.Repository<User>().GetByIdAsync(transaction.PayerId);
                if (payer == null)
                {
                    throw new NotFoundException(ErrorMessage.PAYER_NOT_FOUND);
                }
                var task = null as Core.Entities.Task;
                if (transaction.TaskId.HasValue && transaction.TaskId != 0)
                {
                    task = await _unitOfWork.Repository<Core.Entities.Task>().GetByIdAsync(transaction.TaskId.Value);
                }
                var transactionViewDto = new TransactionViewDto
                {
                    Id = transaction.Id,
                    GroupId = transaction.GroupId,
                    Payer = _mapper.Map<UserViewDto>(payer),
                    Amount = transaction.Amount,
                    Description = transaction.Description,
                    Task = transaction.TaskId.HasValue ? _mapper.Map<TaskViewDto>(task) : null,
                    CreatedAt = transaction.CreatedAt,
                    SplitStrategy = transaction.SplitStrategy,
                    TransactionSplits = _mapper.Map<IEnumerable<TransactionSplitViewDto>>(transaction.TransactionSplits),
                    ProofUrl = transaction.ProofUrl
                };
                transactionViewDtos.Add(transactionViewDto);
            }
            return new PageResultDto<TransactionViewDto>
            {
                Items = transactionViewDtos,
                TotalItems = transactions.TotalItems,
                PageSize = transactions.PageSize,
                PageIndex = transactions.PageIndex,
                TotalPages = transactions.TotalPages
            };
        }
        public async Task<PageResultDto<TransactionViewDto>> GetTransactionsByPayerIdAsync(int payerId, int pageSize, int pageIndex)
        {
            var transactions = await _transactionRepository.GetTransactionsByUserIdAsync(payerId, pageSize, pageIndex);
            var transactionViewDtos = new List<TransactionViewDto>();
            foreach (var transaction in transactions.Items)
            {
                var payer = await _unitOfWork.Repository<User>().GetByIdAsync(transaction.PayerId);
                if (payer == null)
                {
                    throw new NotFoundException(ErrorMessage.PAYER_NOT_FOUND);
                }
                var task = null as Core.Entities.Task;
                if (transaction.TaskId.HasValue && transaction.TaskId != 0)
                {
                    task = await _unitOfWork.Repository<Core.Entities.Task>().GetByIdAsync(transaction.TaskId.Value);
                }
                var transactionViewDto = new TransactionViewDto
                {
                    Id = transaction.Id,
                    GroupId = transaction.GroupId,
                    Payer = _mapper.Map<UserViewDto>(payer),
                    Amount = transaction.Amount,
                    Description = transaction.Description,
                    Task = transaction.TaskId.HasValue ? _mapper.Map<TaskViewDto>(task) : null,
                    CreatedAt = transaction.CreatedAt,
                    SplitStrategy = transaction.SplitStrategy,
                    TransactionSplits = _mapper.Map<IEnumerable<TransactionSplitViewDto>>(transaction.TransactionSplits)
                };
                transactionViewDtos.Add(transactionViewDto);
            }
            return new PageResultDto<TransactionViewDto>
            {
                Items = transactionViewDtos,
                TotalItems = transactions.TotalItems,
                PageSize = transactions.PageSize,
                PageIndex = transactions.PageIndex
            };
        }
        public async Task<bool> DeleteTransactionAsync(int userId, int transactionId)
        {
            var transaction = await _transactionRepository.GetTransactionDetailsAsync(transactionId);
            if (transaction == null)
            {
                throw new NotFoundException(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            if (transaction.PayerId != userId)
            {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACTION);
            }

            // If it's an EXPENSE
            if (transaction.Type == Core.Enums.TransactionTypeEnum.EXPENSE)
            {
                if (transaction.Status == Core.Enums.TransactionStatusEnum.PENDING)
                {
                    throw new InternalServerError(ErrorMessage.TRANSACTION_IS_PENDING_CANNOT_BE_DELETED);
                }

                var allTransactionSplits = transaction.TransactionSplits.ToList();
                var paymentGroupMember = await _groupMemberRepository.GetGroupMemberAsync(transaction.PayerId, transaction.GroupId);
                if (paymentGroupMember is null)
                {
                    throw new NotFoundException(ErrorMessage.GROUP_MEMBER_NOT_FOUND);
                }
                await _groupMemberRepository.UpdateBalanceAsync(transaction.GroupId, transaction.PayerId, -transaction.Amount);

                foreach (var item in allTransactionSplits)
                {
                    await _groupMemberRepository.UpdateBalanceAsync(transaction.GroupId, item.DebtorId, item.OwedAmount);
                    if (item.DebtorId != transaction.PayerId)
                    {
                        await _groupDebtRepository.SyncGroupDebtAsync(transaction.GroupId, item.DebtorId, transaction.PayerId, -item.OwedAmount);
                    }
                }
            }
            // If it's a PAYMENT (Settlement)
            else if (transaction.Type == Core.Enums.TransactionTypeEnum.PAYMENT)
            {
                if (transaction.Status == Core.Enums.TransactionStatusEnum.DONE)
                {
                    var split = transaction.TransactionSplits.FirstOrDefault();
                    var receiverId = split?.DebtorId ?? 0;

                    // Revert debtor balance (was increased by Amount, now subtract)
                    await _groupMemberRepository.UpdateBalanceAsync(transaction.GroupId, transaction.PayerId, -transaction.Amount);

                    // Revert creditor balance (was reduced by Amount, now add back)
                    if (receiverId != 0)
                    {
                        await _groupMemberRepository.UpdateBalanceAsync(transaction.GroupId, receiverId, transaction.Amount);
                        // Revert debt reduction (restore debt owed from payer to receiver)
                        await _groupDebtRepository.SyncGroupDebtAsync(transaction.GroupId, transaction.PayerId, receiverId, transaction.Amount);
                    }
                }
                // If PENDING, no balances or debts were modified yet
            }

            _transactionRepository.Delete(transaction);
            await _transactionSplitRepository.DeleteTransactionAsync(transactionId);
            await _unitOfWork.CompleteAsync();
            return true;
        }
        public async Task<IEnumerable<int>> GetDebtIdsAsync(int transactionId)
        {
            var transactionSplits = await _transactionSplitRepository.GetByTransactionIdAsync(transactionId, int.MaxValue, 1);
            return transactionSplits.Items.Select(ts => ts.DebtorId).ToList();
        }

        public async Task<int> CreateSingleSettlementAsync(int userId, CreateSettlementDto data)
        {
            if (userId != data.PayerId)
            {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            if (data.Amount <= 0)
            {
                throw new BadRequestException(ErrorMessage.TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO);
            }
            if (data.PayerId == data.ReceiverId)
            {
                throw new BadRequestException("You cannot settle a debt with yourself.");
            }

            var payerMember = await _groupMemberRepository.CheckUserInGroupAsync(data.GroupId, data.PayerId);
            var receiverMember = await _groupMemberRepository.CheckUserInGroupAsync(data.GroupId, data.ReceiverId);
            if (payerMember is null || receiverMember is null)
            {
                throw new NotFoundException("Payer or receiver is not a member of this group.");
            }

            // Validate that the payer actually owes the receiver in this group
            var existingDebts = await _groupDebtRepository.FindAsync(gd =>
                gd.GroupId == data.GroupId &&
                gd.FromUserId == data.PayerId &&
                gd.ToUserId == data.ReceiverId);
            var debt = existingDebts.FirstOrDefault();
            if (debt == null || debt.Amount <= 0)
            {
                throw new BadRequestException("You do not owe this member any debt in this group.");
            }
            if (data.Amount > debt.Amount)
            {
                throw new BadRequestException($"The settlement amount ({data.Amount:N0} VND) cannot exceed the outstanding debt ({debt.Amount:N0} VND).");
            }

            var newSettlement = _mapper.Map<Core.Entities.Transaction>(data);
            newSettlement.PaymentType = data.PaymentType;
            newSettlement.Type = Core.Enums.TransactionTypeEnum.PAYMENT;
            newSettlement.SplitStrategy = Core.Enums.SplitStrategyEnum.OTHER;

            if (data.PaymentType == Core.Enums.TransactionPaymentTypeEnum.QR_CODE)
            {
                if (string.IsNullOrWhiteSpace(data.ProofUrl))
                {
                    throw new BadRequestException(ErrorMessage.YOU_MUST_PROVIDE_EVIDENCE);
                }
                newSettlement.ProofUrl = data.ProofUrl;
                newSettlement.Status = Core.Enums.TransactionStatusEnum.PENDING;
                // Balances and debt remain untouched until confirmed by receiver
            }
            else // CASH
            {
                newSettlement.Status = Core.Enums.TransactionStatusEnum.DONE;
                await _groupMemberRepository.UpdateBalanceAsync(data.GroupId, data.PayerId, data.Amount);
                await _groupMemberRepository.UpdateBalanceAsync(data.GroupId, data.ReceiverId, -data.Amount);
                await _groupDebtRepository.SyncGroupDebtAsync(data.GroupId, data.PayerId, data.ReceiverId, -data.Amount);
            }

            await _transactionRepository.AddAsync(newSettlement);
            await _transactionSplitRepository.CreateTransactionSplitAsync(new TransactionSplit
            {
                Transaction = newSettlement,
                DebtorId = data.ReceiverId,
                OwedAmount = data.Amount
            });

            var notiTitle = data.PaymentType == Core.Enums.TransactionPaymentTypeEnum.QR_CODE
                ? "New Settlement Pending Approval"
                : "Cash Settlement Recorded";
            var notiMessage = data.PaymentType == Core.Enums.TransactionPaymentTypeEnum.QR_CODE
                ? $"User {data.PayerId} has submitted a QR settlement of {data.Amount:N0} VND. Please review the proof and confirm."
                : $"User {data.PayerId} recorded a cash settlement of {data.Amount:N0} VND to you.";

            var newNotification = new Notification
            {
                ReceiveId = data.ReceiverId,
                Title = notiTitle,
                Message = notiMessage,
                IsRead = false,
                Type = Core.Enums.NotificationTypeEnum.PAYMENT,
                RelatedTransactionId = newSettlement.Id,
                RelatedGroupId = data.GroupId,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Repository<Notification>().AddAsync(newNotification);
            await _unitOfWork.CompleteAsync();
            return newSettlement.Id;
        }

        public async Task<IEnumerable<int>> CreateMultiSettlementAsyc(int userId, List<CreateSettlementDto> data)
        {
            await _unitOfWork.StartTransactionAsync();  // outer transaction
            try
            {
                var result = new List<int>();
                foreach (var settlement in data)
                {
                    var settlementId = await CreateSingleSettlementAsync(userId, settlement);
                    result.Add(settlementId);
                }
                await _unitOfWork.CommitTransactionAsync();
                return result;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransactionAsync();
                throw new InternalServerError(ex.Message);
            }
        }

        public async Task<int> ConfirmSettlementAsync(int transactionId, int userId)
        {
            var transactionRepo = _unitOfWork.Repository<Core.Entities.Transaction>();
            var transaction = await transactionRepo.GetByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new NotFoundException(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            if (transaction.Type != Core.Enums.TransactionTypeEnum.PAYMENT)
            {
                throw new BadRequestException(ErrorMessage.THIS_TRANSACTION_HAS_TYPE_EXPENSE);
            }
            if (transaction.Status == Core.Enums.TransactionStatusEnum.DONE)
            {
                throw new BadRequestException(AlertMessage.TRANSACTION_HAS_BEEN_COMPLETED);
            }

            var transactionSplit = await _transactionSplitRepository.GetByTransactionIdAsync(transactionId, userId);
            if (transactionSplit is null)
            {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACTION);
            }

            await _groupMemberRepository.UpdateBalanceAsync(transaction.GroupId, transaction.PayerId, transaction.Amount);
            await _groupMemberRepository.UpdateBalanceAsync(transaction.GroupId, userId, -transaction.Amount);
            await _groupDebtRepository.SyncGroupDebtAsync(transaction.GroupId, transaction.PayerId, userId, -transaction.Amount);
            transaction.Status = Core.Enums.TransactionStatusEnum.DONE;

            transactionRepo.Update(transaction);

            var newNotification = new Notification
            {
                ReceiveId = transaction.PayerId,
                Title = "Settlement Confirmed",
                Message = $"Your settlement of amount {transaction.Amount:N0} VND has been confirmed by user {userId}.",
                IsRead = false,
                Type = Core.Enums.NotificationTypeEnum.PAYMENT,
                RelatedTransactionId = transaction.Id,
                RelatedGroupId = transaction.GroupId,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Repository<Notification>().AddAsync(newNotification);
            await _unitOfWork.CompleteAsync();
            return transaction.Id;
        }

        public async Task<int> RejectSettlementAsync(int transactionId, int userId)
        {
            var transactionRepo = _unitOfWork.Repository<Core.Entities.Transaction>();
            var transaction = await transactionRepo.GetByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new NotFoundException(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            if (transaction.Type != Core.Enums.TransactionTypeEnum.PAYMENT)
            {
                throw new BadRequestException(ErrorMessage.THIS_TRANSACTION_HAS_TYPE_EXPENSE);
            }
            if (transaction.Status == Core.Enums.TransactionStatusEnum.DONE)
            {
                throw new BadRequestException(AlertMessage.TRANSACTION_HAS_BEEN_COMPLETED);
            }

            var transactionSplit = await _transactionSplitRepository.GetByTransactionIdAsync(transactionId, userId);
            if (transactionSplit is null)
            {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACTION);
            }

            transaction.Status = Core.Enums.TransactionStatusEnum.NONE;
            transactionRepo.Update(transaction);

            var newNotification = new Notification
            {
                ReceiveId = transaction.PayerId,
                Title = "Settlement Rejected",
                Message = $"Your settlement of amount {transaction.Amount:N0} VND was rejected by user {userId}.",
                IsRead = false,
                Type = Core.Enums.NotificationTypeEnum.PAYMENT,
                RelatedTransactionId = transaction.Id,
                RelatedGroupId = transaction.GroupId,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Repository<Notification>().AddAsync(newNotification);
            await _unitOfWork.CompleteAsync();
            return transaction.Id;
        }
        public async Task<PageResultDto<TransactionViewDto>> GetTransactionsByGroupIdAndPayerIdAsync(int groupId, int payerId, int pageSize, int pageIndex)
        {
            var (transactions, totalCount) = await _unitOfWork.Repository<Core.Entities.Transaction>()
                .GetPagedAsync(t => t.GroupId == groupId && t.PayerId == payerId, pageIndex, pageSize,
                t => t.Payer, t => t.TransactionSplits);
            var transactionDtos = transactions.Select(t => new TransactionViewDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                Payer = _mapper.Map<UserViewDto>(t.Payer),
                GroupId = t.GroupId,
                CreatedAt = t.CreatedAt,
                SplitStrategy = t.SplitStrategy,
                TransactionSplits = _mapper.Map<IEnumerable<TransactionSplitViewDto>>(t.TransactionSplits),
                ProofUrl = t.ProofUrl,

            }).ToList();

            return new PageResultDto<TransactionViewDto>
            {
                Items = transactionDtos,
                TotalItems = totalCount,
                PageSize = pageSize,
                PageIndex = pageIndex
            };
        }
    }
}


