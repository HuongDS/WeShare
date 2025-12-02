using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.User
{
    public class UpdateUserDto
    {
        public string FullName { get; set; }
        public string? Avatar { get; set; }
        public string? DefaultBankAccount { get; set; }
    }
}
