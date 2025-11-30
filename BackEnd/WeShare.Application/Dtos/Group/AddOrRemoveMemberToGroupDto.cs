using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.Group
{
    public class AddOrRemoveMemberToGroupDto
    {
        public int GroupId { get; set; }
        public IEnumerable<int> MemberIds { get; set; }
        public int UserId { get; set; }
    }
}
