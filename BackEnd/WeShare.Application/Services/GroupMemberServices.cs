using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;

namespace WeShare.Application.Services
{
    public class GroupMemberServices : IGroupMemberServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGroupMemberRepository _groupMemberRepository;
        private readonly IMapper _mapper;

        public GroupMemberServices(IUnitOfWork unitOfWork, IGroupMemberRepository groupMemberRepository, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _groupMemberRepository = groupMemberRepository;
            _mapper = mapper;
        }

        public async Task<GroupMemberDetailsViewDto> GetMyDebtInGroupsAsync(int userId, int groupId)
        {
            var entity = await _groupMemberRepository.GetGroupMemberAsync(userId, groupId);
            var result = _mapper.Map<GroupMemberDetailsViewDto>(entity);
            return result;
        }

        public async Task<PageResultDto<GroupMemberDetailsViewDto>> GetGroupMembersAsync(int userId, int groupId, int pageSize, int pageIndex)
        {
            var user = await _groupMemberRepository.GetGroupMemberAsync(userId, groupId);
            if (user.Role != Core.Enums.GroupRoleEnum.Leader)
            {
                throw new BadRequestException(ErrorMessage.ONLY_LEADER_CAN_VIEW);
            }
            var result = await _groupMemberRepository.GetGroupMembersPaginationAsync(groupId, pageSize, pageIndex);
            var temp = _mapper.Map<IEnumerable<GroupMemberDetailsViewDto>>(result.Items).ToList();
            return new PageResultDto<GroupMemberDetailsViewDto>
            {
                Items = temp,
                TotalItems = result.TotalItems,
                TotalPages = result.TotalPages,
                PageSize = result.PageSize,
                PageIndex = result.PageIndex
            };
        }
    }
}
