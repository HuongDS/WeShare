using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Core.Entities
{
    public class GroupMember
    {
        public int UserId { get; set; }
        public int GroupId { get; set; }
        public GroupTypeEnum Role { get; set; }
        public decimal Balance { get; set; }
    }
}
