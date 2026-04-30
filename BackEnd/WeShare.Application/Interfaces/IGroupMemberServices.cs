using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Core.Other;

namespace WeShare.Application.Interfaces
{
    public interface IGroupMemberServices
    {
        Task<PageResultDto<GroupMemberDetailsViewDto>> GetGroupMembersAsync(int userId, int groupId, int pageSize, int pageIndex);
        Task<GroupMemberDetailsViewDto> GetMyDebtInGroupsAsync(int userId, int groupId);
    }
}
