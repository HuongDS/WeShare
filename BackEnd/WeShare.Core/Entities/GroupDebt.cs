using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class GroupDebt : IEntity
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int FromUserId { get; set; }
        public int ToUserId { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public DateTime Updated_At { get; set; }
        public Group Group { get; set; }
        [ForeignKey("FromUserId")]
        public User FromUser { get; set; }
        [ForeignKey("ToUserId")]
        public User ToUser { get; set; }
    }
}
