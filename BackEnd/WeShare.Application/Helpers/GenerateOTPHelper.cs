using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Helpers
{
    public static class GenerateOTPHelper
    {
        public static string GenerateOTP(int length = 6)
        {
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}
