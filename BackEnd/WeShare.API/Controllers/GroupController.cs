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

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly IGroupServices _groupServices;

        public GroupController(IGroupServices groupServices)
        {
            _groupServices = groupServices;
        }

        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetGroupAsync([FromRoute] int groupId)
        {
            try
            {
                var res = await _groupServices.GetByIdAsync(groupId);
                return Ok(new ResponseDto<GroupViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_GROUP_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpGet("groups/{pageSize}/{pageIndex}")]
        public async Task<IActionResult> GetGroupsAsync(int pageSize, int pageIndex)
        {
            try
            {
                var userId = User.FindFirst("id")?.Value;
                if (userId is null)
                {
                    return BadRequest(new ResponseDto<bool>
                    {
                        Status = (int)HttpStatusCode.BadRequest,
                        Message = ErrorMessage.SOME_THING_WENT_WRONG,
                        Data = false
                    });
                }
                var res = await _groupServices.GetAllByUserIdAsync(int.Parse(userId), pageSize, pageIndex);
                return Ok(new ResponseDto<PageResultDto<GroupViewDto>>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_GROUP_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }
        [HttpPost]
        public async Task<IActionResult> CreateGroupAsync([FromBody] CreateGroupDto data)
        {
            try
            {
                var userId = User.FindFirst("id")?.Value;
                if (userId is null)
                {
                    return BadRequest(new ResponseDto<bool>
                    {
                        Status = (int)HttpStatusCode.BadRequest,
                        Message = ErrorMessage.SOME_THING_WENT_WRONG,
                        Data = false
                    });
                }
                var res = await _groupServices.CreateGroupAsync(int.Parse(userId), data);
                return Ok(new ResponseDto<GroupViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.CREATE_GROUP_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }
        [HttpPost("add-members")]
        public async Task<IActionResult> AddMembersAsync([FromBody] AddOrRemoveMemberToGroupDto data)
        {
            try
            {
                var res = await _groupServices.AddMemberToGroupAsync(data);
                return Ok(new ResponseDto<GroupViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.ADD_MEMBER_TO_GROUP_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }
        [HttpDelete("members")]
        public async Task<IActionResult> RemoveMemberToGroupAsync([FromBody] AddOrRemoveMemberToGroupDto data)
        {
            try
            {
                var res = await _groupServices.RemoveMemberToGroupAsync(data);
                return Ok(new ResponseDto<GroupViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.REMOVE_MEMBER_TO_GROUP_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }
        [HttpPut]
        public async Task<IActionResult> UpdateGroupAsync([FromBody] UpdateGroupDto data)
        {
            try
            {
                var res = await _groupServices.UpdateGroupAsync(data);
                return Ok(new ResponseDto<GroupViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.UPDATE_MEMBER_TO_GROUP_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }
        [HttpDelete("{groupId}")]
        public async Task<IActionResult> DeleteGroupAsync([FromRoute] int groupId)
        {
            try
            {
                var userId = User.FindFirst("id")?.Value;
                if (userId is null)
                {
                    return BadRequest(new ResponseDto<bool>
                    {
                        Status = (int)HttpStatusCode.BadRequest,
                        Message = ErrorMessage.SOME_THING_WENT_WRONG,
                        Data = false
                    });
                }
                await _groupServices.DeleteGroupAsync(groupId, int.Parse(userId));
                return Ok(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.DELETE_GROUP_SUCCESSFULLY,
                    Data = null
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }
    }
}
