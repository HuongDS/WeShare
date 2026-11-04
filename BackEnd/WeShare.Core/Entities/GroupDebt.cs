using System;
using System.ComponentModel.DataAnnotations.Schema;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class GroupDebt : BaseAuditableEntity
    {
        public int GroupId { get; set; }
        public int FromUserId { get; set; }
        public int ToUserId { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public Group Group { get; set; } = null!;
        [ForeignKey("FromUserId")]
        public User FromUser { get; set; } = null!;
        [ForeignKey("ToUserId")]
        public User ToUser { get; set; } = null!;
    }
}
