using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Helpers;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;

namespace WeShare.Application.Services
{
    public class TransactionSplitServices : ITransactionSplitServices
    {
        private readonly ITransactionSplitRepository _transactionSplitRepository;
        private readonly IUnitOfWork _unitOfWork;

        public TransactionSplitServices(ITransactionSplitRepository transactionSplitRepository, IUnitOfWork unitOfWork)
        {
            _transactionSplitRepository = transactionSplitRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<PageResultDto<TransactionSplit>> GetByTransactionIdAsync(int transactionId, TransactionSplitStatusEnum? status, int pageSize, int pageIndex)
        {
            return await _transactionSplitRepository.GetByTransactionIdAsync(transactionId, status, pageSize, pageIndex);
        }
        public async Task<PageResultDto<TransactionSplit>> GetByDebtorIdAsync(int debtorId, TransactionSplitStatusEnum? status, int pageSize, int pageIndex)
        {
            return await _transactionSplitRepository.GetByDebtorIdAsync(debtorId, status, pageSize, pageIndex);
        }
        public async Task<IEnumerable<TransactionSplit>> CreateTransactionSplitAsync(IEnumerable<TransactionSplit> dto)
        {
            var res = await _transactionSplitRepository.CreateTransactionSplitAsync(dto);
            await _unitOfWork.CompleteAsync();
            return res;
        }
        public async System.Threading.Tasks.Task DeleteTransactionAsync(int transactionId)
        {
            await _transactionSplitRepository.DeleteTransactionAsync(transactionId);
        }
        public Task<IEnumerable<TransactionSplit>> CalculateTransactionSplitAmountAsync(int transactionId, List<int> debtIds, decimal totalAmount, SplitStrategyEnum typeStrategy, Dictionary<int, decimal>? splitAmount)
        {
            if (debtIds is null || debtIds.Count <= 0)
            {
                throw new Exception(ErrorMessage.DEBTOR_EMPTY);
            }
            var result = new List<TransactionSplit>();
            var splitAmounts = CalculateSplitHelper.CalculateSplitAmount(totalAmount, debtIds, typeStrategy, splitAmount);
            foreach (var item in splitAmounts)
            {
                var tmp = new TransactionSplit
                {
                    TransactionId = transactionId,
                    DebtorId = item.Key,
                    OwedAmount = item.Value,
                    Status = TransactionSplitStatusEnum.UNPAID
                };
                result.Add(tmp);
            }
            return System.Threading.Tasks.Task.FromResult<IEnumerable<TransactionSplit>>(result);
        }
    }
}
