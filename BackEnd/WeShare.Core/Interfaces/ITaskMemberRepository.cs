using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Enums;

namespace WeShare.Core.Interfaces
{
    public interface ITaskMemberRepository
    {
        System.Threading.Tasks.Task AddAsync(TaskMember data);
        System.Threading.Tasks.Task AddRangeAsync(IEnumerable<TaskMember> data);
        void DeleteAsync(TaskMember data);
        void DeleteRangeAsync(IEnumerable<TaskMember> data);
        Task<IEnumerable<TaskMember>?> GetByGroupIdAsync(int groupId);
        Task<IEnumerable<TaskMember>> GetByTaskIdAsync(int taskId);
        Task<IEnumerable<TaskMember>> GetByUserIdAndStatusAsync(int userId, TaskStatusEnum status);
        Task<IEnumerable<TaskMember>> GetByUserIdAsync(int userId);
        TaskMember UpdateAsync(TaskMember data);
    }
}
