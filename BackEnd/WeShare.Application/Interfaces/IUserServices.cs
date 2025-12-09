using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.User;

namespace WeShare.Application.Interfaces
{
    public interface IUserServices
    {
        Task<UserViewDto> GetUserProfileAsync(int userId);
        Task<UserViewDto> UpdatePasswordAsync(int userId, UpdatePasswordDto data);
        Task<UserViewDto> UpdateUserProfileAsync(int userId, UpdateUserDto data);
    }
}
