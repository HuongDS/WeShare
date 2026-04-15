using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.VietQr
{
    public class BankDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Bin { get; set; }
        public string ShortName { get; set; }
        public string Logo { get; set; }
    }
}
