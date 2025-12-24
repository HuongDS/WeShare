using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure.Repositories
{
    public class TaskMemberRepository : ITaskMemberRepository
    {
        private readonly WeShareDbContext _context;

        public TaskMemberRepository(WeShareDbContext context)
        {
            _context = context;
        }
        public async System.Threading.Tasks.Task AddAsync(TaskMember data)
        {
            await _context.TaskMembers.AddAsync(data);
        }
        public async System.Threading.Tasks.Task AddRangeAsync(IEnumerable<TaskMember> data)
        {
            await _context.TaskMembers.AddRangeAsync(data);
        }
        public TaskMember UpdateAsync(TaskMember data)
        {
            _context.Update(data);
            return data;
        }
        public void DeleteAsync(TaskMember data)
        {
            _context.TaskMembers.Remove(data);
        }
        public void DeleteRangeAsync(IEnumerable<TaskMember> data)
        {
            _context.TaskMembers.RemoveRange(data);
        }
        public async Task<IEnumerable<TaskMember>> GetByTaskIdAsync(int taskId)
        {
            return await _context.TaskMembers.Where(tm => tm.TaskId == taskId).ToListAsync();
        }
        public async Task<IEnumerable<TaskMember>> GetByUserIdAsync(int userId)
        {
            return await _context.TaskMembers.Where(tm => tm.UserId == userId).ToListAsync();
        }
        public async Task<IEnumerable<TaskMember>?> GetByGroupIdAsync(int groupId)
        {
            return await _context.TaskMembers.Where(tm => tm.GroupId == groupId).ToListAsync();
        }
        public async Task<IEnumerable<TaskMember>> GetByUserIdAndStatusAsync(int userId, TaskStatusEnum status)
        {
            return await _context.TaskMembers
                .Where(tm => tm.UserId == userId && tm.Status == status)
                .ToListAsync();
        }
    }
}
