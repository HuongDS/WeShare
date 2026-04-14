using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.User;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Interfaces;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userServices;
        private readonly ICurrentUserService _currentUserService;

        public UserController(IUserServices userServices, ICurrentUserService currentUserService)
        {
            _userServices = userServices;
            _currentUserService = currentUserService;
        }
        [HttpGet]
        public async Task<IActionResult> GetUserProfile()
        {
            var userId = _currentUserService.GetUserId();
            var userProfile = await _userServices.GetUserProfileAsync(userId);
            return Ok(new ResponseDto<UserViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_USER_PROFILE_SUCCESSFULLY,
                Data = userProfile
            });
        }
        [HttpPut]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserDto data)
        {
            var userId = _currentUserService.GetUserId();
            var updatedUserProfile = await _userServices.UpdateUserProfileAsync(userId, data);
            return Ok(new ResponseDto<UserViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_USER_PROFILE_SUCCESSFULLY,
                Data = updatedUserProfile
            });
        }

        [HttpPut("payment-infor")]
        public async Task<IActionResult> UpdatePaymentInfor([FromBody] UpdatePaymentDto data)
        {
            var userId = _currentUserService.GetUserId();
            await _userServices.UpdatePaymentInfor(userId, data);
            return Ok(new ResponseDto<object>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_PAYMENT_INFO_SUCCESSFULLY,
                Data = null
            });
        }
    }
}
