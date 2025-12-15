using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using WeShare.Infrastructure.Extension;

namespace WeShare.Infrastructure.Repositories
{
    public class TransactionRepository : GenericRepository<Transaction>, ITransactionRepository
    {
        public TransactionRepository(WeShareDbContext context) : base(context)
        {
        }
        public async Task<PageResultDto<Transaction>> GetTransactionsByGroupIdAsync(int groupId, int pageSize, int pageIndex)
        {
            var query = _dbSet.Where(t => t.GroupId == groupId);
            return await PaginationExtension.PaginationAsync(query, pageSize, pageIndex);
        }
        public async Task<PageResultDto<Transaction>> GetTransactionsByUserIdAsync(int userId, int pageSize, int pageIndex)
        {
            var query = _dbSet.Where(t => t.PayerId == userId);
            return await PaginationExtension.PaginationAsync(query, pageSize, pageIndex);
        }
        public async Task<Transaction?> GetTransactionsByTaskIdAsync(int taskId)
        {
            return await _dbSet.FirstOrDefaultAsync(t => t.TaskId == taskId);
        }
        public async Task<Transaction?> GetTransactionDetailsAsync(int transactionId)
        {
            return await _dbSet.Include(t => t.Group).Include(t => t.TransactionSplits).ThenInclude(t => t.Debtor).FirstOrDefaultAsync(t => t.Id == transactionId);
        }
        public async System.Threading.Tasks.Task AddRangeAsync(List<Transaction> data)
        {
            await _dbSet.AddRangeAsync(data);
        }
    }
}
