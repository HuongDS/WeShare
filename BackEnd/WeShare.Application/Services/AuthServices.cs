
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WeShare.Application.Dtos.Auth;
using WeShare.Application.Helpers;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Auth;
using WeShare.Core.Entities;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure.Services
{
    public class AuthServices : IAuthServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IGoogleValidator _googleValidator;
        private readonly ICacheServices _cacheServices;
        private readonly IEmailServices _emailServices;

        public AuthServices(IUnitOfWork unitOfWork, IConfiguration configuration, IMapper mapper, IGoogleValidator googleValidator,
            ICacheServices cacheServices, IEmailServices emailServices)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _mapper = mapper;
            _googleValidator = googleValidator;
            _cacheServices = cacheServices;
            _emailServices = emailServices;
        }
        public async Task<string> RegisterAsync(RegisterDto data)
        {
            var userRepo = _unitOfWork.Repository<User>();

            var existingUser = await userRepo.FindAsync(u => u.Email == data.Email);
            if (existingUser.Count() != 0)
            {
                throw new BadRequestException(ErrorMessage.USER_HAS_BEEN_EXIST);
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(data.Password, Core.Constants.Regex.Regex.PASSWORD_REGEX))
            {
                throw new BadRequestException(ErrorMessage.PASSWORD_IS_WEAK);
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(data.Email, Core.Constants.Regex.Regex.EMAIL_REGEX))
            {
                throw new BadRequestException(ErrorMessage.EMAIL_INVALID);
            }
            var otp = GenerateOTPHelper.GenerateOTP();
            var serializedData = JsonSerializer.Serialize(data);
            var key = $"register-otp-{data.Email}-{otp}";
            await _cacheServices.SetAsync(key, serializedData, 5);

            // Get email templete
            var emailTempletePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "EmailTemplete", "OtpEmail.html");
            if (!File.Exists(emailTempletePath))
            {
                throw new InternalServerError(ErrorMessage.EMAIL_TEMPLATE_NOT_FOUND);
            }
            var htmlContent = await File.ReadAllTextAsync(emailTempletePath);
            htmlContent = htmlContent.Replace("{{UserName}}", data.FullName);
            htmlContent = htmlContent.Replace("{{OTP_CODE}}", otp);
            await _emailServices.SendEmailAsync(data.Email, EmailSubjects.VERIFY_EMAIL, htmlContent);
            return AlertMessage.PLEASE_VERIFY_OTP_TO_LOGIN;
        }
        public async Task<string> VerifyRegisterOTP(VerifyOtpDto data)
        {
            var key = $"register-otp-{data.Email}-{data.Otp}";
            var entity = await _cacheServices.GetAsync(key);
            if (entity == null)
            {
                throw new BadRequestException(ErrorMessage.OTP_IS_INVALID);
            }
            await _cacheServices.RemoveAsync(key);
            var userRepo = _unitOfWork.Repository<User>();
            var decryptEntity = JsonSerializer.Deserialize<RegisterDto>(entity);
            string hashPassword = BCrypt.Net.BCrypt.HashPassword(decryptEntity.Password);
            var newUser = _mapper.Map<User>(decryptEntity);
            newUser.PasswordHashed = hashPassword;
            await userRepo.AddAsync(newUser);
            await _unitOfWork.CompleteAsync();

            var welcomeEmailTempletePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "EmailTemplete", "WelcomeEmail.html");
            if (!File.Exists(welcomeEmailTempletePath))
            {
                throw new InternalServerError(ErrorMessage.EMAIL_TEMPLATE_NOT_FOUND);
            }
            var htmlContent = await File.ReadAllTextAsync(welcomeEmailTempletePath);
            htmlContent = htmlContent.Replace("{{UserName}}", newUser.FullName);
            htmlContent = htmlContent.Replace("{{LoginLink}}", newUser.FullName);
            await _emailServices.SendEmailAsync(newUser.Email, EmailSubjects.WELCOME_TO_WESHARE, htmlContent);
            return SuccessMessage.REGISTER_SUCCESSFULLY;
        }
        public async Task<AuthResponseDto> LoginAsync(LoginDto data)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var checkEmailExist = await userRepo.FindAsync(u => u.Email == data.Email);
            if (!System.Text.RegularExpressions.Regex.IsMatch(data.Email, Core.Constants.Regex.Regex.EMAIL_REGEX))
            {
                throw new BadRequestException(ErrorMessage.EMAIL_INVALID);
            }
            if (checkEmailExist is null || checkEmailExist.FirstOrDefault() == null)
            {
                throw new BadRequestException(ErrorMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            var user = checkEmailExist.FirstOrDefault();
            if (!BCrypt.Net.BCrypt.Verify(data.Password, user.PasswordHashed))
            {
                throw new BadRequestException(ErrorMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }

            var authRes = GenerateAuthResponseTokens(user, out RefreshToken newToken);
            await _unitOfWork.Repository<RefreshToken>().AddAsync(newToken);
            await _unitOfWork.CompleteAsync();
            return authRes;
        }
        public async Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto data)
        {
            var rtRepo = _unitOfWork.Repository<RefreshToken>();
            var storedTokens = await rtRepo.FindAsync(x => x.Token == data.RefreshToken);
            var storedToken = storedTokens.FirstOrDefault();
            if (storedToken is null)
            {
                throw new Exception(ErrorMessage.TOKEN_INVALID);
            }
            if (storedToken.IsRevoked)
            {
                throw new Exception(ErrorMessage.TOKEN_IS_REVOKED);
            }
            if (storedToken.ExpiryDate < DateTime.UtcNow)
            {
                throw new Exception(ErrorMessage.TOKEN_IS_EXPIRED);
            }
            if (storedToken.IsUsed)
            {
                var allTokens = await rtRepo.FindAsync(rt => rt.UserId == storedToken.UserId);
                foreach (var item in allTokens)
                {
                    item.IsRevoked = true;
                    rtRepo.Update(item);
                }
                throw new Exception(ErrorMessage.ALERT_INVALID_LOGIN);
            }
            storedToken.IsUsed = true;
            rtRepo.Update(storedToken);
            await _unitOfWork.CompleteAsync();

            var userRepo = _unitOfWork.Repository<User>();
            var users = await userRepo.FindAsync(u => u.Id == storedToken.UserId);
            var user = users.FirstOrDefault();
            if (user is null)
            {
                throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
            }

            var authResponse = GenerateAuthResponseTokens(user, out RefreshToken newToken);
            await rtRepo.AddAsync(newToken);
            await _unitOfWork.CompleteAsync();

            return authResponse;
        }
        public async Task<AuthResponseDto> LoginGoogleAsync(GoogleLoginDto data)
        {
            var payload = await _googleValidator.ValidateAsync(data.IdToken);
            if (payload is null || string.IsNullOrEmpty(payload.Email))
            {
                throw new BadRequestException(ErrorMessage.LOGIN_FAILED);
            }
            var email = payload.Email;
            var userRepo = _unitOfWork.Repository<User>();
            var users = await userRepo.FindAsync(x => x.Email == email);
            var user = users.FirstOrDefault();
            if (user is null)
            {
                var firstName = payload.GivenName;
                var lastName = payload.FamilyName;
                var avatar = payload.Picture;
                var registData = new RegisterDto
                {
                    Email = email,
                    FullName = firstName + " " + lastName,
                    Avatar = avatar
                };
                var newUser = _mapper.Map<User>(registData);
                await userRepo.AddAsync(newUser);

                var authRes = GenerateAuthResponseTokens(newUser, out RefreshToken newToken);
                await _unitOfWork.Repository<RefreshToken>().AddAsync(newToken);
                await _unitOfWork.CompleteAsync();
                return authRes;
            }
            var existingAuthResponse = GenerateAuthResponseTokens(user, out RefreshToken existingNewToken);
            await _unitOfWork.Repository<RefreshToken>().AddAsync(existingNewToken);
            await _unitOfWork.CompleteAsync();

            return existingAuthResponse;
        }
        public async Task<bool> LogoutAsync(TokenRequestDto data)
        {
            var rtRepo = _unitOfWork.Repository<RefreshToken>();
            var storedRTokens = await rtRepo.FindAsync(rt => rt.Token == data.RefreshToken);
            var storedToken = storedRTokens.FirstOrDefault();
            if (storedToken is null)
            {
                return true;
            }
            storedToken.IsRevoked = true;
            storedToken.IsUsed = true;
            rtRepo.Update(storedToken);
            await _unitOfWork.CompleteAsync();
            return true;
        }
        public async Task<bool> LogoutForceAsync(int userId)
        {
            var rtRepo = _unitOfWork.Repository<RefreshToken>();
            var storedTokens = await rtRepo.FindAsync(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiryDate > DateTime.UtcNow);
            foreach (var item in storedTokens)
            {
                item.IsRevoked = true;
                rtRepo.Update(item);
            }
            await _unitOfWork.CompleteAsync();
            return true;
        }
        private (string TokenString, string Id) GenerateJwtToken(User user)
        {
            var jwtHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(40),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = jwtHandler.CreateToken(tokenDescriptor);
            return (jwtHandler.WriteToken(token), token.Id);
        }
        private string GenerateRefreshToken()
        {
            var random = new byte[32];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(random);
                return Convert.ToBase64String(random);
            }
        }
        private AuthResponseDto GenerateAuthResponseTokens(User user, out RefreshToken newRefreshToken)
        {
            var newAccess = GenerateJwtToken(user);
            var newRefresh = GenerateRefreshToken();

            newRefreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefresh,
                JwtId = newAccess.Id,
                IsUsed = false,
                IsRevoked = false,
                AddedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddMonths(1)
            };

            var res = _mapper.Map<AuthResponseDto>(user);
            res.AccessToken = newAccess.TokenString;
            res.RefreshToken = newRefresh;

            return res;
        }
    }
}
