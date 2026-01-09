using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Other;

namespace WeShare.Core.Interfaces
{
    public interface ITransactionSplitRepository
    {
        Task<IEnumerable<TransactionSplit>> CreateTransactionSplitAsync(IEnumerable<TransactionSplit> dto);
        Task<TransactionSplit> CreateTransactionSplitAsync(TransactionSplit dto);
        System.Threading.Tasks.Task DeleteTransactionAsync(int transactionId);
        Task<PageResultDto<TransactionSplit>> GetByDebtorIdAsync(int debtorId, int pageSize, int pageIndex);
        Task<PageResultDto<TransactionSplit>> GetByTransactionIdAsync(int transactionId, int pageSize, int pageIndex);
        Task<IEnumerable<TransactionSplit>> GetByTransactionIdAsync(int transactionId);
        Task<TransactionSplit?> GetByTransactionIdAsync(int transactionId, int userId);
    }
}
