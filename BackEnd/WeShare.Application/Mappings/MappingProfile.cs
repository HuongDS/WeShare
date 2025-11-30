using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Core.Dtos.Auth;
using WeShare.Core.Entities;

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
        }
    }
}
