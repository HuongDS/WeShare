using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Transaction;
using WeShare.Core.Other;

namespace WeShare.Application.Interfaces
{
    public interface ITransactionServices
    {
        Task<TransactionViewDto> CreateTransactionAsync(int userId, CreateTransactionDto data);
        Task<bool> DeleteTransactionAsync(int userId, int transactionId);
        Task<IEnumerable<int>> GetDebtIdsAsync(int transactionId);
        Task<TransactionViewDto> GetTransactionDetailsAsync(int transactionId);
        Task<PageResultDto<TransactionViewDto>> GetTransactionsByGroupIdAsync(int groupId, int pageSize, int pageIndex);
        Task<PageResultDto<TransactionViewDto>> GetTransactionsByPayerIdAsync(int payerId, int pageSize, int pageIndex);
        Task<bool> IsUserPayerOfTransactionAsync(int userId, int transactionId);
        Task<TransactionViewDto> UpdateTransactionAsync(int userId, UpdateTransactionDto data);
    }
}
