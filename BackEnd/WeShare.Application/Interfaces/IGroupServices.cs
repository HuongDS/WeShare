using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.Other;

namespace WeShare.Application.Interfaces
{
    public interface IGroupServices
    {
        Task<GroupViewDto> AddMemberToGroupAsync(AddOrRemoveMemberToGroupDto data);
        Task<GroupViewDto> CreateGroupAsync(int userId, CreateGroupDto data);
        Task<GroupViewDto> GetByIdAsync(int groupId);
        Task<GroupViewDto> RemoveMemberToGroupAsync(AddOrRemoveMemberToGroupDto data);
        Task<GroupViewDto> UpdateGroupAsync(UpdateGroupDto data);
        Task DeleteGroupAsync(int groupId, int userId);
        Task<PageResultDto<GroupViewDto>> GetAllByUserIdAsync(int userId, int pageSize, int pageIndex);
    }
}
