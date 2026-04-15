using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WeShare.Application.Dtos.Cloudinary;

namespace WeShare.Application.Interfaces
{
    public interface IFileServices
    {
        Task<bool> DeleteImageAsync(string publicId);
        Task<ImageUploadResult> UploadImageAsync(IFormFile file, string folderName);
    }
}
