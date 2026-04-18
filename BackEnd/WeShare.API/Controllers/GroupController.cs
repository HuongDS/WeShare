using System.Net;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.Other;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly IGroupServices _groupServices;
        private readonly ICurrentUserService _currentUserService;

        public GroupController(IGroupServices groupServices, ICurrentUserService currentUserService)
        {
            _groupServices = groupServices;
            _currentUserService = currentUserService;
        }

        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetGroupAsync([FromRoute] int groupId)
        {
            var res = await _groupServices.GetByIdAsync(groupId);
            return Ok(new ResponseDto<GroupViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_GROUP_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpGet("groups/{pageSize}/{pageIndex}")]
        public async Task<IActionResult> GetGroupsAsync(int pageSize, int pageIndex)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _groupServices.GetAllByUserIdAsync(userId, pageSize, pageIndex);
            return Ok(new ResponseDto<PageResultDto<GroupViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_GROUP_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPost]
        public async Task<IActionResult> CreateGroupAsync([FromBody] CreateGroupDto data)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _groupServices.CreateGroupAsync(userId, data);
            return Ok(new ResponseDto<GroupViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.CREATE_GROUP_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPost("add-members")]
        public async Task<IActionResult> AddMembersAsync([FromBody] AddOrRemoveMemberToGroupDto data)
        {
            var res = await _groupServices.AddMemberToGroupAsync(data);
            return Ok(new ResponseDto<GroupViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.ADD_MEMBER_TO_GROUP_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpDelete("members")]
        public async Task<IActionResult> RemoveMemberToGroupAsync([FromBody] AddOrRemoveMemberToGroupDto data)
        {
            var res = await _groupServices.RemoveMemberToGroupAsync(data);
            return Ok(new ResponseDto<GroupViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.REMOVE_MEMBER_TO_GROUP_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPut]
        public async Task<IActionResult> UpdateGroupAsync([FromBody] UpdateGroupDto data)
        {

            var res = await _groupServices.UpdateGroupAsync(data);
            return Ok(new ResponseDto<GroupViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_MEMBER_TO_GROUP_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpDelete("{groupId}")]
        public async Task<IActionResult> DeleteGroupAsync([FromRoute] int groupId)
        {
            var userId = _currentUserService.GetUserId();
            await _groupServices.DeleteGroupAsync(groupId, userId);
            return Ok(new ResponseDto<object>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.DELETE_GROUP_SUCCESSFULLY,
                Data = null
            });
        }
    }
}
