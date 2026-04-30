using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.GroupMember
{
    public class GroupMemberDetailsViewDto
    {
        public WeShare.Core.Entities.User User { get; set; }
        public int GroupId { get; set; }
        public GroupRoleEnum Role { get; set; }
        public decimal Balance { get; set; }
    }
}
