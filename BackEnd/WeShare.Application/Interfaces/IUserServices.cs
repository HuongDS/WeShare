using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Other;
using WeShare.Application.Dtos.User;

namespace WeShare.Application.Interfaces
{
    public interface IUserServices
    {
        Task<UserViewDto> GetUserProfileAsync(int userId);
        Task<UserViewDto> UpdateUserProfileAsync(int userId, UpdateUserDto data);
        Task UpdatePaymentInfor(int userId, UpdatePaymentDto data);
        Task<UserViewDto> UpdateAvatarAsync(int userId, string? url, string? publicId);
        Task<PageResultDto<UserViewDto>> GetUserProfilesAsync(string key, int pageSize, int pageIndex);
    }
}
