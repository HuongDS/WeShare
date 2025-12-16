using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using WeShare.Infrastructure.Extension;

namespace WeShare.Infrastructure.Repositories
{
    public class EventRepository : GenericRepository<WeShare.Core.Entities.Event>, IEventRepository
    {
        public EventRepository(WeShareDbContext context) : base(context)
        {
        }

        public async Task<PageResultDto<Event>> GetWithPaginationAsync(int pageSize, int pageIndex, string key, DateTime? date, DateTime? time)
        {
            var query = _dbSet.Where(e => e.Name.Contains(key) ||
            (e.Description != null && e.Description.Contains(key)) ||
            (date.HasValue && e.Date == date.Value.Date) ||
            (time.HasValue && e.Time == time.Value)).AsQueryable();
            return await PaginationExtension.PaginationAsync<Event>(query, pageSize, pageIndex);
        }
    }
}
