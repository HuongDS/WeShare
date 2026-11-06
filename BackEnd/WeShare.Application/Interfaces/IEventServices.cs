using System.Text.Json;
using WeShare.Application.Dtos.Event;
using WeShare.Core.Other;
namespace WeShare.Application.Interfaces;
public interface IEventServices
{
    Task<EventViewDto> CreateEventAsync(EventCreateDto data);
    Task<bool> DeleteEventAsync(int eventId, string? version = null, int? groupId = null);
    Task<PageResultDto<EventViewDto>> GetAsync(int userId, int pageSize, int pageIndex, string key, DateTime? date);
    Task<PageResultDto<EventViewDto>> GetByGroupAsync(int groupId, EventQueryDto query);
    Task<IEnumerable<EventViewDto>> GetByGroupIdAsync(int groupId);
    Task<EventViewDto> GetByIdAsync(int eventId, int? groupId = null);
    Task<EventViewDto> UpdateEventAsync(EventUpdateDto data);
    Task<EventViewDto> PatchAsync(int groupId, int eventId, JsonElement patch, string version);
}
