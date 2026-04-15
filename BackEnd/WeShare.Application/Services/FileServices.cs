using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Interfaces;
using CloudinaryDotNet;
using Microsoft.Extensions.Configuration;
using WeShare.Application.Dtos.Cloudinary;
using Microsoft.AspNetCore.Http;
using CloudinaryDotNet.Actions;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services
{
    public class FileServices : IFileServices
    {
        private readonly Cloudinary _cloudinary;

        public FileServices(IConfiguration configuration)
        {
            var acc = new Account(
                configuration["CloudinarySettings:CloudName"],
                configuration["CloudinarySettings:ApiKey"],
                configuration["CloudinarySettings:ApiSecret"]
            );
            _cloudinary = new Cloudinary(acc);
        }

        public async Task<Dtos.Cloudinary.ImageUploadResult> UploadImageAsync(IFormFile file, string folderName)
        {
            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folderName,
                    Transformation = new Transformation().Quality("auto").FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    throw new InternalServerError(uploadResult.Error.Message);
                }



                return new Dtos.Cloudinary.ImageUploadResult
                {
                    PublicId = uploadResult.PublicId,
                    Url = uploadResult.SecureUrl.ToString()
                };
            }
            return null;
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
            {
                throw new BadRequestException("PublicId cannot be null or empty");
            }
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            if (result.Result != "ok")
            {
                throw new InternalServerError($"Failed to delete image with PublicId: {publicId}");
            }
            return true;
        }
    }
}
