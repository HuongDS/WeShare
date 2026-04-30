using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupMemberController : ControllerBase
    {
        private readonly IGroupMemberServices _groupMemberServices;
        private readonly ICurrentUserService _currentUserService;

        public GroupMemberController(IGroupMemberServices groupMemberServices, ICurrentUserService currentUserService)
        {
            _groupMemberServices = groupMemberServices;
            _currentUserService = currentUserService;
        }
        [HttpGet("group/me/{groupId}")]
        public async Task<IActionResult> GetMyDebtInGroupAsync([FromRoute] int groupId)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _groupMemberServices.GetMyDebtInGroupsAsync(userId, groupId);
            return Ok(new ResponseDto<GroupMemberDetailsViewDto>
            {
                Status = (int)System.Net.HttpStatusCode.OK,
                Message = SuccessMessage.GET_MY_DEBT_IN_GROUP_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpGet("group/members/{groupId}/{pageSize}/{pageIndex}")]
        public async Task<IActionResult> GetGroupMembersAsync([FromRoute] int groupId, int pageSize, int pageIndex)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _groupMemberServices.GetGroupMembersAsync(userId, groupId, pageSize, pageIndex);
            return Ok(new ResponseDto<PageResultDto<GroupMemberDetailsViewDto>>
            {
                Status = (int)System.Net.HttpStatusCode.OK,
                Message = SuccessMessage.GET_GROUP_MEMBERS_SUCCESSFULLY,
                Data = res
            });
        }
    }
}
