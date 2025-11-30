using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Group = WeShare.Core.Entities.Group;

namespace WeShare.Application.Services
{
    public class GroupServices : IGroupServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IGroupMemberRepository _groupMemberRepository;

        public GroupServices(IUnitOfWork unitOfWork, IMapper mapper, IGroupMemberRepository groupMemberRepository)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _groupMemberRepository = groupMemberRepository;
        }
        public async Task<GroupViewDto> CreateGroupAsync(int userId, CreateGroupDto data)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var newGroup = _mapper.Map<Group>(data);
            await groupRepo.AddAsync(newGroup);

            var newGroupMember = await _groupMemberRepository.AddAsync(newGroup.Id, userId);
            await _unitOfWork.CompleteAsync();

            var res = _mapper.Map<GroupViewDto>(newGroup);
            res.Members = new[] { _mapper.Map<GroupMemberViewDto>(newGroupMember) };
            return res;
        }
        public async Task<GroupViewDto> GetByIdAsync(int groupId)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(groupId);
            if (storedGroup is null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }

            var memberInGroups = await _groupMemberRepository.GetAsync(groupId);
            var res = _mapper.Map<GroupViewDto>(storedGroup);
            res.Members = _mapper.Map<IEnumerable<GroupMemberViewDto>>(memberInGroups);
            return res;
        }
        public async Task<IEnumerable<GroupViewDto>> GetAllByUserIdAsync(int userId)
        {
            var storedGroupIds = await _groupMemberRepository.GetByUserIdAsync(userId);
            var res = new List<GroupViewDto>();
            foreach (var item in storedGroupIds)
            {
                var tmp = await GetByIdAsync(item);
                res.Add(tmp);
            }
            return res;
        }
        public async Task<GroupViewDto> AddMemberToGroupAsync(AddOrRemoveMemberToGroupDto data)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(data.GroupId);
            if (storedGroup is null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            var checkRole = await _groupMemberRepository.CheckUserInGroupAsync(data.GroupId, data.UserId);
            if (checkRole is null || checkRole.Role != Core.Enums.GroupRoleEnum.Leader)
            {
                throw new Exception(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }

            var newMembers = await _groupMemberRepository.AddAsync(data.GroupId, data.MemberIds);
            await _unitOfWork.CompleteAsync();

            return await GetByIdAsync(data.GroupId);
        }
        public async Task<GroupViewDto> RemoveMemberToGroupAsync(AddOrRemoveMemberToGroupDto data)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(data.GroupId);
            if (storedGroup is null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            var checkRole = await _groupMemberRepository.CheckUserInGroupAsync(data.GroupId, data.UserId);
            if (checkRole is null || checkRole.Role != Core.Enums.GroupRoleEnum.Leader)
            {
                throw new Exception(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }

            var deleteMembers = data.MemberIds.Select(m => new GroupMember
            {
                GroupId = data.GroupId,
                UserId = m,
                Role = Core.Enums.GroupRoleEnum.Member,
                Balance = 0
            });
            _groupMemberRepository.Delete(deleteMembers);
            await _unitOfWork.CompleteAsync();

            return await GetByIdAsync(data.GroupId);
        }
        public async Task<GroupViewDto> UpdateGroupAsync(UpdateGroupDto data)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(data.GroupId);
            if (storedGroup is null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            storedGroup.Type = data.Type;
            storedGroup.Name = data.Name;
            groupRepo.Update(storedGroup);
            await _unitOfWork.CompleteAsync();
            return await GetByIdAsync(data.GroupId);
        }
        public async System.Threading.Tasks.Task DeleteGroupAsync(int groupId, int userId)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(groupId);
            var checkRole = await _groupMemberRepository.CheckUserInGroupAsync(groupId, userId);
            if (checkRole is null || checkRole.Role != Core.Enums.GroupRoleEnum.Leader)
            {
                throw new Exception(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }
            if (storedGroup is null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            await groupRepo.Delete(groupId);
            await _unitOfWork.CompleteAsync();
        }
    }
}
