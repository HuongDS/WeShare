using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.User
{
    public class VerifyForgotPasswordDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }
}
