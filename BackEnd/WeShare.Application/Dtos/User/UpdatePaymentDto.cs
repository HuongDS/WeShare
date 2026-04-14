using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.User
{
    public class UpdatePaymentDto
    {
        public string BankName { get; set; }
        public string BankAccount { get; set; }
        public string BankBin { get; set; }
    }
}
