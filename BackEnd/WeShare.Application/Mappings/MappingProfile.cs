using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Dtos.Transaction;
using WeShare.Application.Dtos.TransactionSplit;
using WeShare.Application.Dtos.User;
using WeShare.Core.Dtos.Auth;
using WeShare.Core.Entities;
using WeShare.Core.Enums;

namespace WeShare.Core.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.PasswordHashed, opt => opt.Ignore());
            CreateMap<User, AuthResponseDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.FullName));
            CreateMap<Group, GroupViewDto>()
                .ForMember(dest => dest.Members, opt => opt.Ignore());
            CreateMap<GroupMember, GroupMemberViewDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.GroupId, opt => opt.MapFrom(src => src.GroupId))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.Balance, opt => opt.MapFrom(src => src.Balance));
            CreateMap<CreateGroupDto, Group>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                 .ForMember(dest => dest.Id, opt => opt.Ignore())
                 .ForMember(dest => dest.GroupMembers, opt => opt.Ignore())
                 .ForMember(dest => dest.Transactions, opt => opt.Ignore())
                 .ForMember(dest => dest.GroupDebts, opt => opt.Ignore())
                 .ForMember(dest => dest.Events, opt => opt.Ignore());
            CreateMap<UpdateGroupDto, Group>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.GroupId))
                 .ForMember(dest => dest.GroupMembers, opt => opt.Ignore())
                 .ForMember(dest => dest.Transactions, opt => opt.Ignore())
                 .ForMember(dest => dest.GroupDebts, opt => opt.Ignore())
                 .ForMember(dest => dest.Events, opt => opt.Ignore());
            CreateMap<User, UserViewDto>();
            CreateMap<UpdateUserDto, User>();
            CreateMap<Transaction, TransactionViewDto>()
                .ForMember(dest => dest.Payer, opt => opt.Ignore())
                .ForMember(dest => dest.Task, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Created_At))
                .ForMember(dest => dest.TransactionSplits, opt => opt.Ignore());
            CreateMap<CreateTransactionDto, Transaction>();
            CreateMap<TransactionSplitCreateDto, TransactionSplit>();
            CreateMap<TransactionSplit, TransactionSplitViewDto>();
            CreateMap<Entities.Task, TaskViewDto>();
            CreateMap<CreateSettlementDto, Transaction>()
                .ForMember(dest => dest.Created_At, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.SplitStrategy, opt => opt.MapFrom(src => SplitStrategyEnum.OTHER))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => TransactionTypeEnum.PAYMENT));
        }
    }
}
