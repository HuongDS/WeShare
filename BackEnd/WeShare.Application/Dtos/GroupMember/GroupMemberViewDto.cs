using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.GroupMember
{
    public class GroupMemberViewDto
    {
        public int UserId { get; set; }
        public int GroupId { get; set; }
        public GroupRoleEnum Role { get; set; }
        public decimal Balance { get; set; }
    }
}
