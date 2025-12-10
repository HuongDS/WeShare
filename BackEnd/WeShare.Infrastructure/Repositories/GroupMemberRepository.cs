using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using WeShare.Infrastructure.Extension;
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
        public async Task<PageResultDto<int>> GetByUserIdAsync(int userId, int pageSize, int pageIndex)
        {
            var query = _context.GroupMembers.Where(gm => gm.UserId == userId).Select(gm => gm.GroupId).AsQueryable();
            return await PaginationExtension.PaginationAsync(query, pageSize, pageIndex);
        }
        public async Task<GroupMember?> GetByUserIdAsync(int userId)
        {
            return await _context.GroupMembers.FirstOrDefaultAsync(gm => gm.UserId == userId);
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
        public async System.Threading.Tasks.Task RevertTransactionAsync(GroupMember data, decimal balance)
        {
            var entity = await _context.GroupMembers.FirstOrDefaultAsync(gm => gm.UserId == data.UserId && gm.GroupId == data.GroupId);
            if (entity is null)
            {
                throw new Exception(ErrorMessage.GROUP_MEMBER_NOT_FOUND);
            }
            entity.Balance += balance;
            _context.GroupMembers.Update(entity);
        }
        public async System.Threading.Tasks.Task UpdateBalancesRange(Dictionary<int, decimal> groupMemberIds)
        {
            var entities = await _context.GroupMembers.Where(gm => groupMemberIds.Keys.Contains(gm.UserId)).ToListAsync();
            foreach (var entity in entities)
            {
                entity.Balance += groupMemberIds[entity.UserId];
            }
            _context.GroupMembers.UpdateRange(entities);
        }
    }
}
