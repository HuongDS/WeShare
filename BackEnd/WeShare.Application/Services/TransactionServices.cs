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
            var payerMember = await _groupMemberRepository.GetByUserIdAsync(data.PayerId);
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
            transaction.Description = data.Description;
            var debtIds = transaction.TransactionSplits.Select(ts => ts.Debtor.Id).ToList();
            if (data.SplitAmounts != null) debtIds.AddRange(data.SplitAmounts.Keys);
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
                var payerGroupMember = await _groupMemberRepository.GetByUserIdAsync(transaction.PayerId);
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
                if (data.Strategy != Core.Enums.SplitStrategyEnum.EQUALLY)
                {
                    newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(transaction.Amount, debtIds, data.Strategy, data.SplitAmounts);
                }
                else
                {
                    newTransactionSplits = CalculateSplitHelper.CalculateSplitAmount(transaction.Amount, debtIds, data.Strategy, data.SplitAmounts);

                }
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

            // revert
            var allTransactionSplits = transaction.TransactionSplits.ToList();
            var paymentGroupMember = await _groupMemberRepository.GetByUserIdAsync(transaction.PayerId);
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
            var transactionSplits = await _transactionSplitRepository.GetByTransactionIdAsync(transactionId, null, int.MaxValue, 1);
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
            var newSettlement = _mapper.Map<Core.Entities.Transaction>(data);
            var currBalance = await _groupMemberRepository.GetBalanceInGroupAsync(data.GroupId, data.ReceiverId);
            if (data.Amount > currBalance)
            {
                throw new Exception(ErrorMessage.INSUFFICIENT_BALANCE);
            }
            await _groupMemberRepository.UpdateBalancesRange(data.PayerId, data.Amount);
            await _groupMemberRepository.UpdateBalancesRange(data.ReceiverId, -data.Amount);
            await _groupDebtRepository.SyncGroupDebtAsync(data.GroupId, data.PayerId, data.ReceiverId, -data.Amount);
            await _transactionRepository.AddAsync(newSettlement);
            await _transactionSplitRepository.CreateTransactionSplitAsync(new TransactionSplit
            {
                Transaction = newSettlement,
                DebtorId = data.ReceiverId,
                OwedAmount = data.Amount
            });
            await _unitOfWork.CompleteAsync();
            return newSettlement.Id;
        }

        public async Task<IEnumerable<int>> CreateMultiSettlementAsyc(int userId, List<CreateSettlementDto> data)
        {
            if (!data.All(c => c.PayerId == userId))
            {
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            if (data.Any(c => c.Amount <= 0))
            {
                throw new Exception(ErrorMessage.TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO);
            }
            var newTransactionList = new List<Core.Entities.Transaction>();
            foreach (var item in data)
            {
                var tmp = _mapper.Map<Core.Entities.Transaction>(item);
                newTransactionList.Add(tmp);
                await _groupMemberRepository.UpdateBalancesRange(item.ReceiverId, -item.Amount);
                await _groupMemberRepository.UpdateBalancesRange(item.PayerId, item.Amount);
                await _groupDebtRepository.SyncGroupDebtAsync(item.GroupId, item.PayerId, item.ReceiverId, -item.Amount);
            }
            await _transactionRepository.AddRangeAsync(newTransactionList);
            await _unitOfWork.CompleteAsync();
            return newTransactionList.Select(t => t.Id).ToList();
        }
    }
}
