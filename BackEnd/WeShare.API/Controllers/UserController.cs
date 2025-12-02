using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.User;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userServices;

        public UserController(IUserServices userServices)
        {
            _userServices = userServices;
        }
        [HttpGet]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                var userProfile = await _userServices.GetUserProfileAsync(userId);
                return Ok(new ResponseDto<UserViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_USER_PROFILE_SUCCESSFULLY,
                    Data = userProfile
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
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserDto data)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                var updatedUserProfile = await _userServices.UpdateUserProfileAsync(userId, data);
                return Ok(new ResponseDto<UserViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.UPDATE_USER_PROFILE_SUCCESSFULLY,
                    Data = updatedUserProfile
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
        [HttpPut("password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto data)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                var updatedUserProfile = await _userServices.UpdatePasswordAsync(userId, data);
                return Ok(new ResponseDto<UserViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.UPDATE_PASSWORD_SUCCESSFULLY,
                    Data = updatedUserProfile
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
