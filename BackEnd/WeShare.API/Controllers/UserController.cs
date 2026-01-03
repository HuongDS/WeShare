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
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPasword([FromBody] string email)
        {
            try
            {
                var res = await _userServices.SendOTPForgotPassword(email);
                return Ok(new ResponseDto<string>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = AlertMessage.PLEASE_VERIFY_OTP_TO_RESET,
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

        [HttpPost("verify-forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyForgotPassword([FromBody] VerifyForgotPasswordDto data)
        {
            try
            {
                var res = await _userServices.VerifyOTPForgotPassword(data.Email, data.Otp);
                return Ok(new ResponseDto<string>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.VERIFY_OTP_SUCCESSFULLY,
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

        [HttpPut("update-password")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto data)
        {
            try
            {
                var res = await _userServices.UpdatePassword(data);
                return Ok(new ResponseDto<UserViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.UPDATE_PASSWORD_SUCCESSFULLY,
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
    }
}
