using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.User
{
    public class UpdatePasswordDto
    {
        public string NewPassword { get; set; }
        public int UserId { get; set; }
    }
}
