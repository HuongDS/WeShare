using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
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

        public AuthServices(IUnitOfWork unitOfWork, IConfiguration configuration, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _mapper = mapper;
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

            var accessToken = GenerateJwtToken(newUser);
            var refreshToken = GenerateRefreshToken();

            var newRefreshToken = new RefreshToken
            {
                UserId = newUser.Id,
                Token = refreshToken,
                JwtId = accessToken.Id,
                IsUsed = false,
                IsRevoked = false,
                AddedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddMonths(1),
            };
            await _unitOfWork.Repository<RefreshToken>().AddAsync(newRefreshToken);
            await _unitOfWork.CompleteAsync();

            var response = _mapper.Map<AuthResponseDto>(newUser);
            response.AccessToken = accessToken.TokenString;
            response.RefreshToken = refreshToken;

            return response;
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
            var accessToken = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            var newRefreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                JwtId = accessToken.Id,
                IsUsed = false,
                IsRevoked = false,
                AddedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddMonths(1),
            };
            await _unitOfWork.Repository<RefreshToken>().AddAsync(newRefreshToken);
            await _unitOfWork.CompleteAsync();

            var response = _mapper.Map<AuthResponseDto>(user);
            response.AccessToken = accessToken.TokenString;
            response.RefreshToken = refreshToken;

            return response;
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
    }
}
