using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        public AuthController(IAuthServices authServices)
        {
            _authServices = authServices;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterDto data)
        {
            try
            {
                var res = await _authServices.RegisterAsync(data);
                return Ok(new ResponseDto<AuthResponseDto>
                {
                    Data = res,
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.REGISTER_SUCCESSFULLY
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
        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginDto data)
        {
            try
            {
                var res = await _authServices.LoginAsync(data);
                return Ok(new ResponseDto<AuthResponseDto>
                {
                    Data = res,
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.LOGIN_SUCCESSFULLY
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
        [HttpPost("login-google")]
        public async Task<IActionResult> LoginGoogleAsync([FromBody] string idToken)
        {
            try
            {
                var response = await _authServices.LoginGoogleAsync(idToken);
                return Ok(new ResponseDto<AuthResponseDto>
                {
                    Data = response,
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.LOGIN_SUCCESSFULLY
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
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] string refreshToken)
        {
            try
            {
                var res = await _authServices.RefreshTokenAsync(refreshToken);
                return Ok(new ResponseDto<AuthResponseDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.REFRESH_SUCCESSFULLY,
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
        [HttpPost("logout")]
        public async Task<IActionResult> LogOutAsync([FromBody] string refreshToken)
        {
            var res = await _authServices.LogoutAsync(refreshToken);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.LOG_OUT_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPost("logout-force")]
        public async Task<IActionResult> LogOutForce([FromBody] int userId)
        {
            var res = await _authServices.LogoutForceAsync(userId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.LOG_OUT_SUCCESSFULLY,
                Data = res
            });
        }
    }
}
