using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }
        public User User { get; set; }
        public Group Group { get; set; }
    }
}
