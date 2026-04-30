using System.Net;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Other;
using WeShare.Application.Dtos.User;
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
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userServices;
        private readonly ICurrentUserService _currentUserService;
        private readonly IFileServices _fileServices;

        public UserController(IUserServices userServices, ICurrentUserService currentUserService,
            IFileServices fileServices)
        {
            _userServices = userServices;
            _currentUserService = currentUserService;
            _fileServices = fileServices;
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

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserProfile([FromRoute] int id)
        {
            var userProfile = await _userServices.GetUserProfileAsync(id);
            return Ok(new ResponseDto<UserViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_USER_PROFILE_SUCCESSFULLY,
                Data = userProfile
            });
        }
        [HttpGet("find")]
        public async Task<IActionResult> GetUserProfiles([FromQuery] string key, int pageSize, int pageIndex)
        {
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 10;
            var userProfile = await _userServices.GetUserProfilesAsync(key, pageSize, pageIndex);
            return Ok(new ResponseDto<Application.Dtos.Other.PageResultDto<UserViewDto>>
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

        [HttpPost("update-avatar")]
        public async Task<IActionResult> UpdateAvatar(IFormFile file)
        {
            var userId = _currentUserService.GetUserId();
            var uploadResult = await _fileServices.UploadImageAsync(file, "WeShare/Avatars");
            var res = await _userServices.UpdateAvatarAsync(userId, uploadResult.Url, uploadResult.PublicId);
            return Ok(new ResponseDto<UserViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_AVATAR_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpDelete("delete-avatar")]
        public async Task<IActionResult> DeleteAvatar([FromBody] DeleteAvatarDto data)
        {
            var userId = _currentUserService.GetUserId();
            await _fileServices.DeleteImageAsync(data.AvatarPublicId);
            var res = await _userServices.UpdateAvatarAsync(userId, null, null);
            return Ok(new ResponseDto<UserViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_AVATAR_SUCCESSFULLY,
                Data = res
            });
        }
    }
}
