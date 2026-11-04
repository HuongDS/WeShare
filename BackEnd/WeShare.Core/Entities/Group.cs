using System;
using System.Collections.Generic;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Group : BaseAuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public GroupTypeEnum Type { get; set; }
        public string? Description { get; set; }
        public ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<GroupDebt> GroupDebts { get; set; } = new List<GroupDebt>();
        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}
