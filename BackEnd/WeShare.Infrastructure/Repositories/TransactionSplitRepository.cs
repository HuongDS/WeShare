using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WeShare.Application.Dtos.TransactionSplit;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using WeShare.Infrastructure.Extension;

namespace WeShare.Infrastructure.Repositories
{
    public class TransactionSplitRepository : ITransactionSplitRepository
    {
        private readonly WeShareDbContext _context;

        public TransactionSplitRepository(WeShareDbContext context)
        {
            _context = context;
        }
        public async Task<PageResultDto<TransactionSplit>> GetByTransactionIdAsync(int transactionId, int pageSize, int pageIndex)
        {
            var query = _context.TransactionSplits.Where(ts => ts.TransactionId == transactionId);
            return await PaginationExtension.PaginationAsync(query, pageSize, pageIndex);
        }
        public async Task<IEnumerable<TransactionSplit>> GetByTransactionIdAsync(int transactionId)
        {
            return await _context.TransactionSplits.Where(ts => ts.TransactionId == transactionId).ToListAsync();
        }
        public async Task<TransactionSplit?> GetByTransactionIdAsync(int transactionId, int userId)
        {
            return await _context.TransactionSplits.Where(ts => ts.TransactionId == transactionId && ts.DebtorId == userId).FirstOrDefaultAsync();
        }
        public async Task<PageResultDto<TransactionSplit>> GetByDebtorIdAsync(int debtorId, int pageSize, int pageIndex)
        {
            var query = _context.TransactionSplits.Where(ts => ts.DebtorId == debtorId);
            return await PaginationExtension.PaginationAsync(query, pageSize, pageIndex);
        }
        public async Task<IEnumerable<TransactionSplit>> CreateTransactionSplitAsync(IEnumerable<TransactionSplit> dto)
        {
            await _context.TransactionSplits.AddRangeAsync(dto);
            return dto;
        }
        public async Task<TransactionSplit> CreateTransactionSplitAsync(TransactionSplit dto)
        {
            await _context.TransactionSplits.AddAsync(dto);
            return dto;
        }
        public async System.Threading.Tasks.Task DeleteTransactionAsync(int transactionId)
        {
            var transactionSplits = await _context.TransactionSplits.Where(ts => ts.TransactionId == transactionId).ToListAsync();
            _context.TransactionSplits.RemoveRange(transactionSplits);
        }
    }
}
