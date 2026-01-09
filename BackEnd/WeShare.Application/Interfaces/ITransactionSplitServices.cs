using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Other;

namespace WeShare.Application.Interfaces
{
    public interface ITransactionSplitServices
    {
        Task<IEnumerable<TransactionSplit>> CalculateTransactionSplitAmountAsync(int transactionId, List<int> debtIds, decimal totalAmount, SplitStrategyEnum typeStrategy, Dictionary<int, decimal>? splitAmount);
        Task<IEnumerable<TransactionSplit>> CreateTransactionSplitAsync(IEnumerable<TransactionSplit> dto);
        System.Threading.Tasks.Task DeleteTransactionAsync(int transactionId);
        Task<PageResultDto<TransactionSplit>> GetByDebtorIdAsync(int debtorId, TransactionStatusEnum? status, int pageSize, int pageIndex);
    }
}
