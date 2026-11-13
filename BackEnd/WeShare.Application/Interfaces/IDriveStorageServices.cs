using Microsoft.AspNetCore.Http;

namespace WeShare.Application.Interfaces
{
    public interface IDriveStorageServices
    {
        /// <summary>
        /// Uploads an image to Google Drive, makes it viewable by link and returns the shareable URL.
        /// </summary>
        Task<string> UploadImageAsync(IFormFile file, string subFolderName);
    }
}
