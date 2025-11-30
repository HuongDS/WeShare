using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WeShare.Application.Interfaces;
using WeShare.Application.Validators;
using WeShare.Core.Constants;
using WeShare.Core.Constants.Regex;
using WeShare.Core.Dtos.Auth;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure.Services
{
    public class AuthServices : IAuthServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IGoogleValidator _googleValidator;

        public AuthServices(IUnitOfWork unitOfWork, IConfiguration configuration, IMapper mapper, IGoogleValidator googleValidator)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _mapper = mapper;
            _googleValidator = googleValidator;
        }
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto data)
        {
            var userRepo = _unitOfWork.Repository<User>();

            var existingUser = await userRepo.FindAsync(u => u.Email == data.Email);
            if (existingUser.Count() != 0)
            {
                throw new Exception(ErrorMessage.USER_HAS_BEEN_EXIST);
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(data.Password, Core.Constants.Regex.Regex.PASSWORD_REGEX))
            {
                throw new Exception(ErrorMessage.PASSWORD_IS_WEAK);
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(data.Email, Core.Constants.Regex.Regex.EMAIL_REGEX))
            {
                throw new Exception(ErrorMessage.EMAIL_INVALID);
            }
            string hashPassword = BCrypt.Net.BCrypt.HashPassword(data.Password);
            var newUser = _mapper.Map<User>(data);
            newUser.PasswordHashed = hashPassword;
            await userRepo.AddAsync(newUser);
            await _unitOfWork.CompleteAsync();

            return await GenerateAuthResponse(newUser);
        }
        public async Task<AuthResponseDto> LoginAsync(LoginDto data)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var checkEmailExist = await userRepo.FindAsync(u => u.Email == data.Email);
            if (!System.Text.RegularExpressions.Regex.IsMatch(data.Email, Core.Constants.Regex.Regex.EMAIL_REGEX))
            {
                throw new Exception(ErrorMessage.EMAIL_INVALID);
            }
            if (checkEmailExist is null || checkEmailExist.FirstOrDefault() == null)
            {
                throw new Exception(ErrorMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            var user = checkEmailExist.FirstOrDefault();
            if (!BCrypt.Net.BCrypt.Verify(data.Password, user.PasswordHashed))
            {
                throw new Exception(ErrorMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            return await GenerateAuthResponse(user);
        }
        public async Task<AuthResponseDto> RefreshTokenAsync(string oldRt)
        {
            var rtRepo = _unitOfWork.Repository<RefreshToken>();
            var storedTokens = await rtRepo.FindAsync(x => x.Token == oldRt);
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
                await _unitOfWork.CompleteAsync();
                throw new Exception(ErrorMessage.ALERT_INVALID_LOGIN);
            }
            storedToken.IsUsed = true;
            rtRepo.Update(storedToken);

            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(storedToken.UserId);
            if (user is null)
            {
                throw new Exception(ErrorMessage.USER_NOT_FOUND);
            }
            return await GenerateAuthResponse(user);
        }
        public async Task<AuthResponseDto> LoginGoogleAsync(string idToken)
        {
            var payload = await _googleValidator.ValidateAsync(idToken);
            if (payload is null || string.IsNullOrEmpty(payload.Email))
            {
                throw new Exception(ErrorMessage.LOGIN_FAILED);
            }
            var email = payload.Email;
            var firstName = payload.GivenName;
            var lastName = payload.FamilyName;
            var avatar = payload.Picture;

            var userRepo = _unitOfWork.Repository<User>();
            var users = await userRepo.FindAsync(x => x.Email == email);
            var user = users.FirstOrDefault();
            if (user is null)
            {
                var defaultPassword = Guid.NewGuid().ToString("N").Substring(0, 10) + "W@1";
                var registData = new RegisterDto
                {
                    Email = email,
                    FullName = firstName + " " + lastName,
                    Avatar = avatar,
                    Password = defaultPassword,
                };
                return await RegisterAsync(registData);
            }

            return await GenerateAuthResponse(user);
        }
        public async Task<bool> LogoutAsync(string refreshToken)
        {
            var rtRepo = _unitOfWork.Repository<RefreshToken>();
            var storedRTokens = await rtRepo.FindAsync(rt => rt.Token == refreshToken);
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
                Expires = DateTime.UtcNow.AddMinutes(15),
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
        private async Task<AuthResponseDto> GenerateAuthResponse(User user)
        {
            var newAccess = GenerateJwtToken(user);
            var newRefresh = GenerateRefreshToken();

            var newToken = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefresh,
                JwtId = newAccess.Id,
                IsUsed = false,
                IsRevoked = false,
                AddedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddMonths(1)
            };
            await _unitOfWork.Repository<RefreshToken>().AddAsync(newToken);
            await _unitOfWork.CompleteAsync();

            var res = _mapper.Map<AuthResponseDto>(user);
            res.AccessToken = newAccess.TokenString;
            res.RefreshToken = newRefresh;

            return res;
        }
    }
}
