using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Task;
using WeShare.Core.Enums;
using WeShare.Core.Other;

namespace WeShare.Application.Interfaces
{
    public interface ITaskServices
    {
        Task<int> AddAsync(int userId, TaskCreateDto data);
        Task DeleteAsync(int taskId);
        Task<PageResultDto<TaskViewDto>> GetAsync(int pageSize, int pageIndex, string key, TaskStatusEnum? status);
        Task<TaskViewDto> GetByIdAsync(int taskId);
        Task<int> UpdateAsync(int userId, TaskUpdateDto data);
    }
}
