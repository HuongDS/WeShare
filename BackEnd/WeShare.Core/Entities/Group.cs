using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Group : IEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public GroupTypeEnum Type { get; set; }
        public ICollection<GroupMember>? GroupMembers { get; set; }
        public ICollection<Transaction>? Transactions { get; set; }
        public ICollection<GroupDebt>? GroupDebts { get; set; }
        public ICollection<Event>? Events { get; set; }
    }
}
