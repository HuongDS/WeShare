using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Cloudinary;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private readonly IFileServices _fileServices;

        public FilesController(IFileServices fileServices)
        {
            _fileServices = fileServices;
        }

        [HttpPost("upload-image-avatar")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            var res = await _fileServices.UploadImageAsync(file, "WeShare/Avatars");
            return Ok(new ResponseDto<ImageUploadResult>
            {
                Data = res,
                Message = SuccessMessage.UPLOAD_IMAGE_SUCCESSFULLY,
                Status = 200
            });
        }
        [HttpDelete("delete-image")]
        public async Task<IActionResult> DeleteImage([FromQuery] string publicId)
        {
            var res = await _fileServices.DeleteImageAsync(publicId);
            return Ok(new ResponseDto<bool>
            {
                Data = res,
                Message = SuccessMessage.DELETE_IMAGE_SUCCESSFULLY,
                Status = 200
            });
        }
    }
}
