using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.User;
using WeShare.Application.Helpers;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services
{
    public class UserServices : IUserServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICacheServices _cacheServices;

        public UserServices(IUnitOfWork unitOfWork, IMapper mapper, ICacheServices cacheServices)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cacheServices = cacheServices;
        }
        public async Task<UserViewDto> GetUserProfileAsync(int userId)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception(ErrorMessage.USER_PROFILE_NOT_FOUND);
            }
            return _mapper.Map<UserViewDto>(user);
        }
        public async Task<UserViewDto> UpdateUserProfileAsync(int userId, UpdateUserDto data)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception(ErrorMessage.USER_PROFILE_NOT_FOUND);
            }
            user.FullName = data.FullName;
            user.Avatar = data.Avatar;
            user.DefaultBankAccount = data.DefaultBankAccount;
            userRepo.Update(user);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<UserViewDto>(user);
        }
        public async Task<UserViewDto> UpdatePassword(UpdatePasswordDto data)
        {
            var key = $"reset-token-{data.Email}-{data.Code}";
            var cachedOtp = await _cacheServices.GetAsync(key);
            if (cachedOtp == null)
            {
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            await _cacheServices.RemoveAsync(key);
            var users = await _unitOfWork.Repository<User>().FindAsync(u => u.Email == data.Email);
            var user = users.FirstOrDefault();
            if (user == null)
            {
                throw new Exception(ErrorMessage.USER_NOT_FOUND);
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(data.NewPassword, WeShare.Core.Constants.Regex.Regex.PASSWORD_REGEX))
            {
                throw new Exception(ErrorMessage.PASSWORD_IS_WEAK);
            }
            user.PasswordHashed = BCrypt.Net.BCrypt.HashPassword(data.NewPassword);
            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<UserViewDto>(user);
        }

        public async Task<string> VerifyOTPForgotPassword(string email, string otp)
        {
            var key = $"forgot-password-otp-{email}-{otp}";
            var cachedOtp = await _cacheServices.GetAsync(key);
            if (cachedOtp == null)
            {
                throw new Exception(ErrorMessage.OTP_IS_INVALID);
            }
            await _cacheServices.RemoveAsync(key);

            var newOtp = GenerateOTPHelper.GenerateOTP();
            var newKey = $"reset-token-{email}-{newOtp}";
            await _cacheServices.SetAsync(newKey, newOtp, 5);
            return newOtp;
        }

        public async Task<string> SendOTPForgotPassword(string email)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var users = await userRepo.FindAsync(u => u.Email == email);
            var user = users.FirstOrDefault();
            if (user == null)
            {
                throw new Exception(ErrorMessage.USER_NOT_FOUND);
            }
            var otp = GenerateOTPHelper.GenerateOTP();
            var key = $"forgot-password-otp-{user.Email}-{otp}";
            await _cacheServices.SetAsync(key, otp, 5);
            return AlertMessage.PLEASE_VERIFY_OTP_TO_RESET;
        }
    }
}
