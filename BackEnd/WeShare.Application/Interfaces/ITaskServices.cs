using System.Text.Json;
using WeShare.Application.Dtos.Task;
using WeShare.Core.Enums;
using WeShare.Core.Other;
namespace WeShare.Application.Interfaces;
public interface ITaskServices
{
    Task<int> AddAsync(int userId, TaskCreateDto data);
    Task DeleteAsync(int taskId, string? version = null, int? groupId = null);
    Task<PageResultDto<TaskViewDto>> GetAsync(int pageSize, int pageIndex, string key, TaskStatusEnum? status);
    Task<PageResultDto<TaskViewDto>> GetByGroupAsync(int groupId, TaskQueryDto query);
    Task<TaskViewDto> GetByIdAsync(int taskId, int? groupId = null);
    Task<int> UpdateAsync(int userId, TaskUpdateDto data);
    Task<TaskViewDto> PatchAsync(int groupId, int taskId, JsonElement patch, string version, bool statusOnly = false);
}
