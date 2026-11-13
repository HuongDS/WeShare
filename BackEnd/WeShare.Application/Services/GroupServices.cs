using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Application.Dtos.Other;
using WeShare.Application.Dtos.User;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
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
            await _unitOfWork.StartTransactionAsync();
            try
            {
                var groupRepo = _unitOfWork.Repository<Group>();
                var newGroup = _mapper.Map<Group>(data);
                if (string.IsNullOrWhiteSpace(newGroup.InviteCode))
                {
                    newGroup.InviteCode = "WS-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
                }
                await groupRepo.AddAsync(newGroup);
                await _unitOfWork.CompleteAsync();

                var newGroupMember = await _groupMemberRepository.AddAsync(newGroup.Id, userId);
                await _unitOfWork.CommitTransactionAsync();

                var res = _mapper.Map<GroupViewDto>(newGroup);
                res.Members = new[] { _mapper.Map<GroupMemberViewDto>(newGroupMember) };
                return res;
            }
            catch
            {
                await _unitOfWork.RollBackTransactionAsync();
                throw;
            }
        }
        public async Task<GroupViewDto> GetByIdAsync(int groupId)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(groupId);
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }

            var memberInGroups = await _groupMemberRepository.GetAsync(groupId);
            var res = _mapper.Map<GroupViewDto>(storedGroup);
            res.Members = _mapper.Map<IEnumerable<GroupMemberViewDto>>(memberInGroups);
            return res;
        }
        public async Task<Dtos.Other.PageResultDto<GroupViewDto>> GetAllByUserIdAsync(int userId, int pageSize, int pageIndex)
        {
            var storedGroups = await _groupMemberRepository.GetByUserIdAsync(userId, pageSize, pageIndex);
            var res = new List<GroupViewDto>();
            foreach (var item in storedGroups.Items)
            {
                var tmp = await GetByIdAsync(item.GroupId);
                res.Add(tmp);
            }
            return new Dtos.Other.PageResultDto<GroupViewDto>
            {
                Items = res,
                TotalItems = storedGroups.TotalItems,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }
        public async Task<GroupViewDto> AddMemberToGroupAsync(AddOrRemoveMemberToGroupDto data)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(data.GroupId);
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }
            var checkRole = await _groupMemberRepository.CheckUserInGroupAsync(data.GroupId, data.UserId);
            if (checkRole is null || checkRole.Role != Core.Enums.GroupRoleEnum.Leader)
            {
                throw new BadRequestException(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
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
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }
            var checkRole = await _groupMemberRepository.CheckUserInGroupAsync(data.GroupId, data.UserId);
            if (checkRole is null || checkRole.Role != Core.Enums.GroupRoleEnum.Leader)
            {
                throw new BadRequestException(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }

            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var toDelete = new List<GroupMember>();

            foreach (var memberId in data.MemberIds)
            {
                if (memberId == data.UserId)
                {
                    throw new BadRequestException("Trưởng nhóm không thể tự xóa chính mình khỏi nhóm.");
                }

                var member = await _groupMemberRepository.GetGroupMemberAsync(memberId, data.GroupId);
                if (member == null) continue;

                if (Math.Abs(member.Balance) > 0.001m)
                {
                    var name = member.User?.FullName ?? $"ID {member.UserId}";
                    throw new BadRequestException($"Thành viên {name} vẫn còn số dư công nợ ({member.Balance:N0} đ), không thể xóa khỏi nhóm.");
                }

                var activeDebts = await groupDebtRepo.FindAsync(
                    d => d.GroupId == data.GroupId && (d.FromUserId == memberId || d.ToUserId == memberId) && d.Amount > 0);
                if (activeDebts.Any())
                {
                    var name = member.User?.FullName ?? $"ID {member.UserId}";
                    throw new BadRequestException($"Thành viên {name} vẫn còn khoản nợ chưa quyết toán trong nhóm, không thể xóa khỏi nhóm.");
                }

                toDelete.Add(member);
            }

            if (toDelete.Any())
            {
                _groupMemberRepository.Delete(toDelete);
                await _unitOfWork.CompleteAsync();
            }

            return await GetByIdAsync(data.GroupId);
        }
        public async Task<GroupViewDto> UpdateGroupAsync(UpdateGroupDto data)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(data.GroupId);
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }
            storedGroup.Type = data.Type;
            storedGroup.Name = data.Name;
            storedGroup.Description = data.Description;
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
                throw new BadRequestException(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }
            await groupRepo.Delete(groupId);
            await _unitOfWork.CompleteAsync();
        }
        public async Task<IEnumerable<UserViewDto>> GetGroupMembersAsync(int groupId)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(groupId);
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }
            var memberInGroups = await _groupMemberRepository.GetAsync(groupId);
            var res = _mapper.Map<IEnumerable<UserViewDto>>(memberInGroups.Select(m => m.User));
            return res;
        }

        public async Task<GroupInviteInfoDto> GetOrCreateInviteCodeAsync(int groupId, int userId)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(groupId);
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }

            var member = await _groupMemberRepository.CheckUserInGroupAsync(groupId, userId);
            if (member is null)
            {
                throw new BadRequestException(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }

            if (string.IsNullOrWhiteSpace(storedGroup.InviteCode))
            {
                storedGroup.InviteCode = "WS-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
                groupRepo.Update(storedGroup);
                await _unitOfWork.CompleteAsync();
            }

            return new GroupInviteInfoDto
            {
                GroupId = storedGroup.Id,
                GroupName = storedGroup.Name,
                InviteCode = storedGroup.InviteCode,
                InviteUrl = $"/group/join?code={storedGroup.InviteCode}"
            };
        }

        public async Task<GroupViewDto> JoinGroupByInviteCodeAsync(string inviteCode, int userId)
        {
            if (string.IsNullOrWhiteSpace(inviteCode))
            {
                throw new BadRequestException("Mã mời không được để trống.");
            }

            var normalizedCode = inviteCode.Trim().ToUpperInvariant();
            var groupRepo = _unitOfWork.Repository<Group>();
            var groups = await groupRepo.FindAsync(g => g.InviteCode != null && g.InviteCode.ToUpper() == normalizedCode);
            var group = groups.FirstOrDefault();

            if (group is null)
            {
                throw new BadRequestException("Mã mời không hợp lệ hoặc nhóm không tồn tại.");
            }

            var existingMember = await _groupMemberRepository.CheckUserInGroupAsync(group.Id, userId);
            if (existingMember != null)
            {
                throw new BadRequestException("Bạn đã là thành viên của nhóm này rồi.");
            }

            await _groupMemberRepository.AddAsync(group.Id, new[] { userId });
            await _unitOfWork.CompleteAsync();

            return await GetByIdAsync(group.Id);
        }

        public async Task<GroupViewDto> TransferLeaderAsync(int groupId, int currentLeaderId, int newLeaderId)
        {
            if (currentLeaderId == newLeaderId)
            {
                throw new BadRequestException("Bạn đã là Trưởng nhóm rồi.");
            }

            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(groupId);
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }

            var currentLeader = await _groupMemberRepository.GetGroupMemberAsync(currentLeaderId, groupId);
            if (currentLeader is null || currentLeader.Role != Core.Enums.GroupRoleEnum.Leader)
            {
                throw new BadRequestException(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }

            var targetMember = await _groupMemberRepository.GetGroupMemberAsync(newLeaderId, groupId);
            if (targetMember is null)
            {
                throw new BadRequestException("Thành viên được chỉ định không thuộc nhóm này.");
            }

            currentLeader.Role = Core.Enums.GroupRoleEnum.Member;
            targetMember.Role = Core.Enums.GroupRoleEnum.Leader;

            _groupMemberRepository.Update(currentLeader);
            _groupMemberRepository.Update(targetMember);
            await _unitOfWork.CompleteAsync();

            return await GetByIdAsync(groupId);
        }

        public async System.Threading.Tasks.Task LeaveGroupAsync(int groupId, int userId)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var storedGroup = await groupRepo.GetByIdAsync(groupId);
            if (storedGroup is null)
            {
                throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);
            }

            var member = await _groupMemberRepository.GetGroupMemberAsync(userId, groupId);
            if (member is null)
            {
                throw new BadRequestException("Bạn không phải thành viên của nhóm này.");
            }

            if (Math.Abs(member.Balance) > 0.001m)
            {
                throw new BadRequestException($"Bạn còn số dư công nợ ({member.Balance:N0} đ) trong nhóm. Vui lòng thanh toán hết nợ trước khi rời nhóm.");
            }

            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var activeDebts = await groupDebtRepo.FindAsync(
                d => d.GroupId == groupId && (d.FromUserId == userId || d.ToUserId == userId) && d.Amount > 0);
            if (activeDebts.Any())
            {
                throw new BadRequestException("Bạn vẫn còn khoản nợ chưa quyết toán trong nhóm. Vui lòng quyết toán xong trước khi rời nhóm.");
            }

            var allMembers = (await _groupMemberRepository.GetAsync(groupId)).ToList();

            if (member.Role == Core.Enums.GroupRoleEnum.Leader)
            {
                if (allMembers.Count > 1)
                {
                    throw new BadRequestException("Bạn đang là Trưởng nhóm. Vui lòng chuyển quyền Trưởng nhóm cho thành viên khác trước khi rời nhóm.");
                }
                // If only member left, delete group
                _groupMemberRepository.Delete(member);
                await groupRepo.Delete(groupId);
                await _unitOfWork.CompleteAsync();
                return;
            }

            _groupMemberRepository.Delete(member);
            await _unitOfWork.CompleteAsync();
        }
    }
}
