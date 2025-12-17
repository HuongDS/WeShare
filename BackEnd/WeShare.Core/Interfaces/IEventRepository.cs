using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Other;

namespace WeShare.Core.Interfaces
{
    public interface IEventRepository : IGenericRepository<WeShare.Core.Entities.Event>
    {
        Task<PageResultDto<Event>> GetWithPaginationAsync(int pageSize, int pageIndex, string key, DateTime? date, DateTime? time, IEnumerable<int> groupIds);
    }
}
