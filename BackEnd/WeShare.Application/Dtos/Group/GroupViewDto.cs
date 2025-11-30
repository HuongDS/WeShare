using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.GroupMember;
using WeShare.Core.Entities;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Group
{
    public class GroupViewDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public GroupTypeEnum Type { get; set; }
        public IEnumerable<GroupMemberViewDto> Members { get; set; }
    }
}
