using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class User : IEntity
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Avatar { get; set; }
        public string? DefaultBankAccount { get; set; }
        public string? BankName { get; set; }
        public string? BankBin { get; set; }
        public string PasswordHashed { get; set; }
        public ICollection<GroupMember> GroupMembers { get; set; }
    }
}
