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
        Task<UserViewDto> UpdatePassword(UpdatePasswordDto data);
        Task<UserViewDto> GetUserProfileAsync(int userId);
        Task<string> SendOTPForgotPassword(string email);
        Task<UserViewDto> UpdateUserProfileAsync(int userId, UpdateUserDto data);
        Task<string> VerifyOTPForgotPassword(string email, string otp);
        Task UpdatePaymentInfor(int userId, UpdatePaymentDto data);
    }
}
