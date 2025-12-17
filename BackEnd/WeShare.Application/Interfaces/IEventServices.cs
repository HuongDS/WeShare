using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Event;
using WeShare.Core.Other;

namespace WeShare.Application.Interfaces
{
    public interface IEventServices
    {
        Task<EventViewDto> CreateEventAsync(EventCreateDto data);
        Task<bool> DeleteEventAsync(int eventId);
        Task<PageResultDto<EventViewDto>> GetAsync(int userId, int pageSize, int pageIndex, string key, DateTime? date, DateTime? time);
        Task<IEnumerable<EventViewDto>> GetByGroupIdAsync(int groupId);
        Task<EventViewDto> GetByIdAsync(int eventId);
        Task<EventViewDto> UpdateEventAsync(EventUpdateDto data);
    }
}
