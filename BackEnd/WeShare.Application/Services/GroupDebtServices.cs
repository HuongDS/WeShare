using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.GroupDebt;
using WeShare.Application.Interfaces;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services
{
    public class GroupDebtServices : IGroupDebtServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GroupDebtServices(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<GroupDebtViewDto>> GetMyDebtsAsync(int userId, int groupId)
        {
            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var entities = await groupDebtRepo.FindAsync(gd => gd.FromUserId == userId && gd.GroupId == groupId, gd => gd.FromUser, gd => gd.ToUser);
            return _mapper.Map<IEnumerable<GroupDebtViewDto>>(entities);
        }

        public async Task<IEnumerable<GroupDebtViewDto>> GetGroupDebtsThatIOweAsync(int userId, int groupId)
        {
            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var entities = await groupDebtRepo.FindAsync(gd => gd.ToUserId == userId && gd.GroupId == groupId, gd => gd.FromUser, gd => gd.ToUser);
            return _mapper.Map<IEnumerable<GroupDebtViewDto>>(entities);
        }
    }
}
