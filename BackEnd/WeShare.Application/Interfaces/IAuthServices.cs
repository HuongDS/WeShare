using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WeShare.Core.Dtos.Auth;

namespace WeShare.Core.Interfaces
{
    public interface IAuthServices
    {
        Task<AuthResponseDto> LoginAsync(LoginDto data);
        Task<AuthResponseDto> LoginGoogleAsync(string idToken);
        Task<bool> LogoutAsync(string refreshToken);
        Task<bool> LogoutForceAsync(int userId);
        Task<AuthResponseDto> RefreshTokenAsync(string oldRt);
        Task<string> RegisterAsync(RegisterDto data);
        Task<AuthResponseDto> VerifyRegisterOTP(string email, string otp);
    }
}
