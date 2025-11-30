using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace WeShare.Infrastructure.Repositories
{
    public class GroupMemberRepository : IGroupMemberRepository
    {
        private readonly WeShareDbContext _context;

        public GroupMemberRepository(WeShareDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<GroupMember>> GetAsync(int groupId)
        {
            return await _context.GroupMembers.Where(gm => gm.GroupId == groupId).ToListAsync();
        }
        public async Task<IEnumerable<int>> GetByUserIdAsync(int userId)
        {
            return await _context.GroupMembers.Where(gm => gm.UserId == userId).Select(gm => gm.GroupId).ToListAsync();
        }
        public async Task<GroupMember> AddAsync(int groupId, int memberId)
        {
            var newGroupMember = new GroupMember
            {
                UserId = memberId,
                GroupId = groupId,
                Role = Core.Enums.GroupRoleEnum.Leader,
                Balance = 0
            };
            await _context.AddAsync(newGroupMember);
            return newGroupMember;
        }
        public async Task<IEnumerable<GroupMember>> AddAsync(int groupId, IEnumerable<int> memberIds)
        {
            var newMembers = memberIds.Select(m => new GroupMember
            {
                GroupId = groupId,
                UserId = m,
                Role = Core.Enums.GroupRoleEnum.Member,
                Balance = 0
            });
            await _context.AddRangeAsync(newMembers);
            return newMembers;
        }
        public GroupMember Update(GroupMember data)
        {
            _context.GroupMembers.Update(data);
            return data;
        }
        public void Delete(GroupMember data)
        {
            _context.GroupMembers.Remove(data);
        }
        public void Delete(IEnumerable<GroupMember> data)
        {
            _context.GroupMembers.RemoveRange(data);
        }
        public async Task<GroupMember?> CheckUserInGroupAsync(int groupId, int userId)
        {
            return await _context.GroupMembers.FirstOrDefaultAsync(gm => gm.GroupId == groupId && gm.UserId == userId);
        }
    }
}
