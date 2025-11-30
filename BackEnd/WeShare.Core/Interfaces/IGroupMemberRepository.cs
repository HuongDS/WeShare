using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;

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
        Task<IEnumerable<int>> GetByUserIdAsync(int userId);
        GroupMember Update(GroupMember data);
    }
}
