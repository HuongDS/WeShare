using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Other;
using WeShare.Application.Dtos.User;
using WeShare.Application.Helpers;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services
{
    public class UserServices : IUserServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserServices(IUnitOfWork unitOfWork, IMapper mapper, ICacheServices cacheServices, IEmailServices emailServices)
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
                throw new BadRequestException(ErrorMessage.USER_PROFILE_NOT_FOUND);
            }
            return _mapper.Map<UserViewDto>(user);
        }
        public async Task<UserViewDto> UpdateUserProfileAsync(int userId, UpdateUserDto data)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new BadRequestException(ErrorMessage.USER_PROFILE_NOT_FOUND);
            }
            user.FullName = data.FullName;
            user.Avatar = data.Avatar;
            userRepo.Update(user);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<UserViewDto>(user);
        }

        public async System.Threading.Tasks.Task UpdatePaymentInfor(int userId, UpdatePaymentDto data)
        {

            if (data.BankName.Length == 0 || data.BankBin.Length == 0 || data.BankAccount.Length == 0)
            {
                throw new BadRequestException(ErrorMessage.SOME_THING_WENT_WRONG);
            }

            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
            }

            var checkExist = await userRepo.FindAsync(x => x.DefaultBankAccount == data.BankAccount);
            if (checkExist.Any(x => x.Id != userId))
            {
                throw new BadRequestException(ErrorMessage.BANK_ACCOUNT_HAS_BEEN_USED);
            }

            user.BankName = data.BankName;
            user.BankBin = data.BankBin;
            user.DefaultBankAccount = data.BankAccount;

            userRepo.Update(user);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<UserViewDto> UpdateAvatarAsync(int userId, string? url, string? publicId)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
            }
            user.Avatar = url;
            user.AvatarPublicId = publicId;
            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<UserViewDto>(user);
        }
        public async Task<PageResultDto<UserViewDto>> GetUserProfilesAsync(string key, int pageSize, int pageIndex)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var (users, totalItems) = await userRepo.GetPagedAsync(
                x => string.IsNullOrEmpty(key)
                || x.FullName.Contains(key)
                || x.Email.Contains(key), pageIndex, pageSize);
            var res = _mapper.Map<IEnumerable<UserViewDto>>(users);
            return new PageResultDto<UserViewDto>
            {
                Items = res.ToList(),
                TotalItems = totalItems,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }
    }
}
