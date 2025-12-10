using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Other;

namespace WeShare.Core.Interfaces
{
    public interface IGroupMemberRepository
    {
        Task<GroupMember> AddAsync(int groupId, int memberId);
        Task<IEnumerable<GroupMember>> AddAsync(int groupId, IEnumerable<int> memberIds);
        Task<GroupMember?> CheckUserInGroupAsync(int groupId, int userId);
        void Delete(GroupMember data);
        void Delete(IEnumerable<GroupMember> data);
        Task<IEnumerable<GroupMember>> GetAsync(int groupId);
        Task<PageResultDto<int>> GetByUserIdAsync(int userId, int pageSize, int pageIndex);
        Task<GroupMember?> GetByUserIdAsync(int userId);
        System.Threading.Tasks.Task RevertTransactionAsync(GroupMember data, decimal balance);
        GroupMember Update(GroupMember data);
        System.Threading.Tasks.Task UpdateBalancesRange(Dictionary<int, decimal> groupMemberIds);
    }
}
