using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using WeShare.Application.Interfaces;
using WeShare.Core.Exceptions;
using DriveFile = Google.Apis.Drive.v3.Data.File;

namespace WeShare.Application.Services
{
    /// <summary>
    /// Stores uploaded images in the Google Drive of the account that authorized the app (OAuth refresh token).
    /// Required config section "GoogleDrive": ClientId, ClientSecret, RefreshToken. Optional: RootFolderName.
    /// Only the "drive.file" scope is used, so the app only ever sees files/folders it created itself.
    /// </summary>
    public class DriveStorageServices : IDriveStorageServices
    {
        private const long MaxFileSizeBytes = 10 * 1024 * 1024;
        private const string FolderMimeType = "application/vnd.google-apps.folder";
        private static readonly SemaphoreSlim FolderLock = new(1, 1);
        private static readonly Dictionary<string, string> FolderIdCache = new();

        private readonly string? _clientId;
        private readonly string? _clientSecret;
        private readonly string? _refreshToken;
        private readonly string _rootFolderName;

        public DriveStorageServices(IConfiguration configuration)
        {
            _clientId = configuration["GoogleDrive:ClientId"];
            _clientSecret = configuration["GoogleDrive:ClientSecret"];
            _refreshToken = configuration["GoogleDrive:RefreshToken"];
            var rootName = configuration["GoogleDrive:RootFolderName"];
            _rootFolderName = string.IsNullOrWhiteSpace(rootName) ? "WeShare" : rootName.Trim();
        }

        public async Task<string> UploadImageAsync(IFormFile file, string subFolderName)
        {
            ValidateFile(file);

            if (!IsDriveConfigured())
            {
                await using var fallbackStream = new MemoryStream();
                await file.CopyToAsync(fallbackStream);
                var base64 = Convert.ToBase64String(fallbackStream.ToArray());
                return $"data:{file.ContentType};base64,{base64}";
            }

            using var drive = CreateDriveService();

            var rootId = await GetOrCreateFolderAsync(drive, _rootFolderName, parentId: null);
            var targetId = string.IsNullOrWhiteSpace(subFolderName)
                ? rootId
                : await GetOrCreateFolderAsync(drive, subFolderName.Trim(), rootId);

            var metadata = new DriveFile
            {
                Name = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Path.GetFileName(file.FileName)}",
                Parents = new List<string> { targetId }
            };

            await using var stream = file.OpenReadStream();
            var createRequest = drive.Files.Create(metadata, stream, file.ContentType);
            createRequest.Fields = "id";
            var progress = await createRequest.UploadAsync();
            if (progress.Status != Google.Apis.Upload.UploadStatus.Completed)
            {
                throw new InternalServerError($"Tải ảnh lên Google Drive thất bại: {progress.Exception?.Message}");
            }

            var fileId = createRequest.ResponseBody.Id;
            await drive.Permissions.Create(
                new Google.Apis.Drive.v3.Data.Permission { Type = "anyone", Role = "reader" },
                fileId).ExecuteAsync();

            return $"https://drive.google.com/thumbnail?id={fileId}&sz=w2000";
        }

        private static void ValidateFile(IFormFile? file)
        {
            if (file is null || file.Length == 0)
            {
                throw new BadRequestException("Vui lòng chọn một ảnh để tải lên.");
            }
            if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                throw new BadRequestException("Chỉ chấp nhận file ảnh.");
            }
            if (file.Length > MaxFileSizeBytes)
            {
                throw new BadRequestException("Ảnh vượt quá dung lượng tối đa 10MB.");
            }
        }

        private bool IsDriveConfigured() =>
            !string.IsNullOrWhiteSpace(_clientId) &&
            !string.IsNullOrWhiteSpace(_clientSecret) &&
            !string.IsNullOrWhiteSpace(_refreshToken);

        private DriveService CreateDriveService()
        {
            if (!IsDriveConfigured())
            {
                throw new BadRequestException(
                    "Google Drive chưa được cấu hình. Vui lòng khai báo GoogleDrive:ClientId, ClientSecret, RefreshToken.");
            }

            var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = new ClientSecrets { ClientId = _clientId!, ClientSecret = _clientSecret! },
                Scopes = new[] { DriveService.Scope.DriveFile }
            });
            var credential = new UserCredential(flow, "weshare", new TokenResponse { RefreshToken = _refreshToken });

            return new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "WeShare"
            });
        }

        private static async Task<string> GetOrCreateFolderAsync(DriveService drive, string name, string? parentId)
        {
            var cacheKey = $"{parentId ?? "root"}/{name}";
            await FolderLock.WaitAsync();
            try
            {
                if (FolderIdCache.TryGetValue(cacheKey, out var cached))
                {
                    return cached;
                }

                var escaped = name.Replace("\\", "\\\\").Replace("'", "\\'");
                var parentClause = parentId is null ? "'root' in parents" : $"'{parentId}' in parents";
                var listRequest = drive.Files.List();
                listRequest.Q = $"mimeType = '{FolderMimeType}' and name = '{escaped}' and {parentClause} and trashed = false";
                listRequest.Fields = "files(id)";
                var existing = (await listRequest.ExecuteAsync()).Files.FirstOrDefault();

                var folderId = existing?.Id;
                if (folderId is null)
                {
                    var folder = new DriveFile
                    {
                        Name = name,
                        MimeType = FolderMimeType,
                        Parents = parentId is null ? null : new List<string> { parentId }
                    };
                    var createRequest = drive.Files.Create(folder);
                    createRequest.Fields = "id";
                    folderId = (await createRequest.ExecuteAsync()).Id;
                }

                FolderIdCache[cacheKey] = folderId;
                return folderId;
            }
            finally
            {
                FolderLock.Release();
            }
        }
    }
}
