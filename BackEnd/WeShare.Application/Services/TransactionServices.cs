using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using AutoMapper;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Dtos.Transaction;
using WeShare.Application.Dtos.TransactionSplit;
using WeShare.Application.Dtos.User;
using WeShare.Application.Helpers;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
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
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            var newTransaction = new Core.Entities.Transaction
            {
                GroupId = data.GroupId,
                PayerId = data.PayerId,
                Amount = data.Amount,
                Description = data.Description,
                Created_At = DateTime.UtcNow,
                SplitStrategy = data.Stategy,
                Type = data.Type
            };
            if (data.TaskId.HasValue)
            {
                newTransaction.TaskId = data.TaskId.Value;
            }
            await _transactionRepository.AddAsync(newTransaction);
            var payerMember = await _groupMemberRepository.GetGroupMemberAsync(data.PayerId, data.GroupId);
            if (payerMember is null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            payerMember.Balance += data.Amount;
            var newTransactionSplits = new Dictionary<int, decimal>();
            if (data.Stategy != Core.Enums.SplitStrategyEnum.EQUALLY)
            {
                newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(data.Amount, data.DebtIds, data.Stategy, data.SplitAmounts);
            }
            else
            {
                newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(data.Amount, data.DebtIds, data.Stategy, data.SplitAmounts);
            }

            var notiRepo = _unitOfWork.Repository<Notification>();

            foreach (var split in newTransactionSplits)
            {
                var transactionSplit = new TransactionSplit
                {
                    Transaction = newTransaction,
                    DebtorId = split.Key,
                    OwedAmount = split.Value
                };
                await _groupMemberRepository.UpdateBalancesRange(split.Key, -split.Value);
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
                    Created_At = DateTime.UtcNow
                };
                await notiRepo.AddAsync(newNoti);
            }
            await _unitOfWork.CompleteAsync();

            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(newTransaction.PayerId);
            if (user == null)
            {
                throw new Exception(ErrorMessage.PAYER_NOT_FOUND);
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
                CreatedAt = newTransaction.Created_At.Value,
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
                throw new Exception(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            return transaction.PayerId == userId;
        }
        public async Task<TransactionViewDto> UpdateTransactionAsync(int userId, UpdateTransactionDto data)
        {
            var transaction = await _transactionRepository.GetTransactionDetailsAsync(data.Id);
            if (transaction == null)
            {
                throw new Exception(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            if (transaction.PayerId != userId)
            {
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            if (transaction.Status == Core.Enums.TransactionStatusEnum.PENDING)
            {
                throw new Exception(ErrorMessage.TRANSACTION_IS_PENDING);
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
                    throw new Exception(ErrorMessage.GROUP_MEMBER_NOT_FOUND);
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
                    await _groupMemberRepository.UpdateBalancesRange(split.Key, -split.Value);
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
                throw new Exception(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            var payer = await _unitOfWork.Repository<User>().GetByIdAsync(transaction.PayerId);
            if (payer == null)
            {
                throw new Exception(ErrorMessage.PAYER_NOT_FOUND);
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
                CreatedAt = transaction.Created_At.Value,
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
                    throw new Exception(ErrorMessage.PAYER_NOT_FOUND);
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
                    CreatedAt = transaction.Created_At.Value,
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
        public async Task<PageResultDto<TransactionViewDto>> GetTransactionsByPayerIdAsync(int payerId, int pageSize, int pageIndex)
        {
            var transactions = await _transactionRepository.GetTransactionsByUserIdAsync(payerId, pageSize, pageIndex);
            var transactionViewDtos = new List<TransactionViewDto>();
            foreach (var transaction in transactions.Items)
            {
                var payer = await _unitOfWork.Repository<User>().GetByIdAsync(transaction.PayerId);
                if (payer == null)
                {
                    throw new Exception(ErrorMessage.PAYER_NOT_FOUND);
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
                    CreatedAt = transaction.Created_At.Value,
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
                throw new Exception(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            if (transaction.PayerId != userId)
            {
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            if (transaction.Status == Core.Enums.TransactionStatusEnum.PENDING)
            {
                throw new Exception(ErrorMessage.TRANSACTION_IS_PENDING_CANNOT_BE_DELETED);
            }

            // revert
            var allTransactionSplits = transaction.TransactionSplits.ToList();
            var paymentGroupMember = await _groupMemberRepository.GetGroupMemberAsync(transaction.PayerId, transaction.GroupId);
            if (paymentGroupMember is null)
            {
                throw new Exception(ErrorMessage.GROUP_MEMBER_NOT_FOUND);
            }
            await _groupMemberRepository.RevertTransactionAsync(paymentGroupMember, -transaction.Amount);
            var groupMembers = await _groupMemberRepository.GetAsync(transaction.GroupId);
            foreach (var item in groupMembers)
            {
                var tmp = allTransactionSplits.FirstOrDefault(ts => ts.DebtorId == item.UserId);
                if (tmp is null) continue;
                await _groupMemberRepository.RevertTransactionAsync(item, tmp.OwedAmount);
            }
            foreach (var item in allTransactionSplits)
            {
                await _groupDebtRepository.SyncGroupDebtAsync(transaction.GroupId, item.DebtorId, transaction.PayerId, item.OwedAmount);
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
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            if (data.Amount <= 0)
            {
                throw new Exception(ErrorMessage.TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO);
            }
            var currBalance = await _groupMemberRepository.GetBalanceInGroupAsync(data.GroupId, data.ReceiverId);
            if (data.Amount > currBalance)
            {
                throw new Exception(ErrorMessage.INSUFFICIENT_BALANCE);
            }
            var newSettlement = _mapper.Map<Core.Entities.Transaction>(data);
            newSettlement.PaymentType = data.PaymentType;
            if (data.PaymentType == Core.Enums.TransactionPaymentTypeEnum.QR_CODE)
            {
                if (data.ProofUrl is null)
                {
                    throw new Exception(ErrorMessage.YOU_MUST_PROVIDE_EVIDENCE);
                }
                newSettlement.ProofUrl = data.ProofUrl;
            }
            else
            {
                await _groupMemberRepository.UpdateBalancesRange(data.PayerId, data.Amount);
                await _groupMemberRepository.UpdateBalancesRange(data.ReceiverId, -data.Amount);
                await _groupDebtRepository.SyncGroupDebtAsync(data.GroupId, data.PayerId, data.ReceiverId, -data.Amount);
            }
            newSettlement.Status = Core.Enums.TransactionStatusEnum.PENDING;
            await _transactionRepository.AddAsync(newSettlement);
            await _transactionSplitRepository.CreateTransactionSplitAsync(new TransactionSplit
            {
                Transaction = newSettlement,
                DebtorId = data.ReceiverId,
                OwedAmount = data.Amount
            });

            var newNotification = new Notification
            {
                ReceiveId = data.ReceiverId,
                Title = "New Settlement Created",
                Message = $"A settlement of amount {data.Amount} has been created by user {data.PayerId}. Please review it.",
                IsRead = false,
                Type = Core.Enums.NotificationTypeEnum.PAYMENT,
                RelatedTransactionId = newSettlement.Id,
                RelatedGroupId = data.GroupId,
                Created_At = DateTime.UtcNow
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
                    // This Single function calls _unitOfWork.CompleteAsync()
                    // But because of the outer Transaction, it hasn't actually saved to the database yet.
                    // It only "marks" that it will save.
                    var settlementId = await CreateSingleSettlementAsync(userId, settlement);
                    result.Add(settlementId);
                }
                await _unitOfWork.CommitTransactionAsync();
                return result;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollBackTransactionAsync();
                throw new Exception(ex.Message);
            }
        }

        public async Task<int> ConfirmSettlementAsync(int transactionId, int userId)
        {
            var transactionRepo = _unitOfWork.Repository<Core.Entities.Transaction>();
            var transaction = await transactionRepo.GetByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new Exception(ErrorMessage.TRANSACTION_NOT_FOUND);
            }
            if (transaction.Type != Core.Enums.TransactionTypeEnum.PAYMENT)
            {
                throw new Exception(ErrorMessage.THIS_TRANSACTION_HAS_TYPE_EXPENSE);
            }
            if (transaction.Status == Core.Enums.TransactionStatusEnum.DONE)
            {
                throw new Exception(AlertMessage.TRANSACTION_HAS_BEEN_COMPLETED);
            }

            var transactionSplit = await _transactionSplitRepository.GetByTransactionIdAsync(transactionId, userId);
            if (transactionSplit is null)
            {
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }

            await _groupMemberRepository.UpdateBalancesRange(transaction.PayerId, transaction.Amount);
            await _groupMemberRepository.UpdateBalancesRange(userId, -transaction.Amount);
            await _groupDebtRepository.SyncGroupDebtAsync(transaction.GroupId, transaction.PayerId, userId, -transaction.Amount);
            transaction.Status = Core.Enums.TransactionStatusEnum.DONE;

            transactionRepo.Update(transaction);

            var newNotification = new Notification
            {
                ReceiveId = transaction.PayerId,
                Title = "Settlement Confirmed",
                Message = $"Your settlement of amount {transaction.Amount} has been confirmed by user {userId}.",
                IsRead = false,
                Type = Core.Enums.NotificationTypeEnum.PAYMENT,
                RelatedTransactionId = transaction.Id,
                RelatedGroupId = transaction.GroupId,
                Created_At = DateTime.UtcNow
            };
            await _unitOfWork.Repository<Notification>().AddAsync(newNotification);
            await _unitOfWork.CompleteAsync();
            return transaction.Id;
        }
    }
}
