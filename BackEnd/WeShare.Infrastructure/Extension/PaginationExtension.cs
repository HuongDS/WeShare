using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Other;

namespace WeShare.Infrastructure.Extension
{
    public static class PaginationExtension
    {
        public static async Task<PageResultDto<T>> PaginationAsync<T>(IQueryable<T> query, int pageSize, int pageIndex)
        {
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize <= 0) pageSize = 10;
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PageResultDto<T>
            {
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = items,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }
    }
}
