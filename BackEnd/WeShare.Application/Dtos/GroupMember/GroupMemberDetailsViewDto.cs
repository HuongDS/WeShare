using WeShare.Application.Dtos.User;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.GroupMember
{
    public class GroupMemberDetailsViewDto
    {
        public UserViewDto? User { get; set; }
        public int GroupId { get; set; }
        public GroupRoleEnum Role { get; set; }
        public decimal Balance { get; set; }
    }
}
