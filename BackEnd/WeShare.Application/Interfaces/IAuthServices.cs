using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WeShare.Application.Dtos.Auth;
using WeShare.Core.Dtos.Auth;

namespace WeShare.Core.Interfaces
{
    public interface IAuthServices
    {
        Task<string> ForgotPasswordAsync(ForgotPasswordDto data);
        Task<AuthResponseDto> LoginAsync(LoginDto data);
        Task<AuthResponseDto> LoginGoogleAsync(GoogleLoginDto data);
        Task<bool> LogoutAsync(TokenRequestDto data);
        Task<bool> LogoutForceAsync(int userId);
        Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto data);
        Task<string> RegisterAsync(RegisterDto data);
        Task<string> VerifyForgotPasswordOTPAndResetPassword(ResetPasswordDto data);
        Task<string> VerifyRegisterOTP(VerifyOtpDto data);
    }
}
