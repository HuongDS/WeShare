using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Other;

namespace WeShare.Core.Interfaces
{
    public interface ITransactionRepository : IGenericRepository<Transaction>
    {
        Task<Transaction?> GetTransactionDetailsAsync(int transactionId);
        Task<PageResultDto<Transaction>> GetTransactionsByGroupIdAsync(int groupId, int pageSize, int pageIndex);
        Task<Transaction?> GetTransactionsByTaskIdAsync(int taskId);
        Task<PageResultDto<Transaction>> GetTransactionsByUserIdAsync(int userId, int pageSize, int pageIndex);
    }
}
