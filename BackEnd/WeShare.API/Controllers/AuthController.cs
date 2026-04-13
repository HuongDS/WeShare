using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Auth;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Auth;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Interfaces;
using WeShare.Infrastructure.Services;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthServices _authServices;
        private readonly ICurrentUserService _currentUserService;

        public AuthController(IAuthServices authServices, ICurrentUserService currentUserService)
        {
            _authServices = authServices;
            _currentUserService = currentUserService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterDto data)
        {
            var res = await _authServices.RegisterAsync(data);
            return Ok(new ResponseDto<string>
            {
                Data = res,
                Status = (int)HttpStatusCode.OK,
                Message = AlertMessage.PLEASE_VERIFY_OTP_TO_COMPLETE_REGISTERATION,
            });
        }
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyRegisterOTP([FromBody] VerifyOtpDto data)
        {
            var res = await _authServices.VerifyRegisterOTP(data);
            return Ok(new ResponseDto<string>
            {
                Data = res,
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.REGISTER_SUCCESSFULLY,
            });
        }
        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginDto data)
        {
            var res = await _authServices.LoginAsync(data);
            return Ok(new ResponseDto<AuthResponseDto>
            {
                Data = res,
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.LOGIN_SUCCESSFULLY
            });
        }
        [HttpPost("google")]
        public async Task<IActionResult> LoginGoogleAsync([FromBody] GoogleLoginDto data)
        {
            var response = await _authServices.LoginGoogleAsync(data);
            return Ok(new ResponseDto<AuthResponseDto>
            {
                Data = response,
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.LOGIN_SUCCESSFULLY
            });
        }
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] TokenRequestDto data)
        {
            var res = await _authServices.RefreshTokenAsync(data);
            return Ok(new ResponseDto<AuthResponseDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.REFRESH_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> LogOutAsync([FromBody] TokenRequestDto data)
        {
            var res = await _authServices.LogoutAsync(data);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.LOG_OUT_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPost("logout-all-devices")]
        [Authorize]
        public async Task<IActionResult> LogOutForce()
        {
            var userId = _currentUserService.GetUserId();
            var res = await _authServices.LogoutForceAsync(userId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.LOG_OUT_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto data)
        {
            var res = await _authServices.ForgotPasswordAsync(data);
            return Ok(new ResponseDto<string>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.FORGOT_PASSWORD_EMAIL_SENT,
                Data = res
            });
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto data)
        {
            var res = await _authServices.VerifyForgotPasswordOTPAndResetPassword(data);
            return Ok(new ResponseDto<string>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.PASSWORD_RESET_SUCCESSFULLY,
                Data = res
            });
        }
    }
}