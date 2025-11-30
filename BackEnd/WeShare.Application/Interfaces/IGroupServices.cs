using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Group;

namespace WeShare.Application.Interfaces
{
    public interface IGroupServices
    {
        Task<GroupViewDto> AddMemberToGroupAsync(AddOrRemoveMemberToGroupDto data);
        Task<GroupViewDto> CreateGroupAsync(int userId, CreateGroupDto data);
        Task<IEnumerable<GroupViewDto>> GetAllByUserIdAsync(int userId);
        Task<GroupViewDto> GetByIdAsync(int groupId);
        Task<GroupViewDto> RemoveMemberToGroupAsync(AddOrRemoveMemberToGroupDto data);
        Task<GroupViewDto> UpdateGroupAsync(UpdateGroupDto data);
        Task DeleteGroupAsync(int groupId, int userId);
    }
}
