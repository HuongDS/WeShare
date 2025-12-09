using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.User;
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

        public UserServices(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
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
        public async Task<UserViewDto> UpdatePasswordAsync(int userId, UpdatePasswordDto data)
        {
            if (userId != data.UserId)
            {
                throw new Exception(ErrorMessage.UNAUTHORIZED_ACTION);
            }
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
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
    }
}
