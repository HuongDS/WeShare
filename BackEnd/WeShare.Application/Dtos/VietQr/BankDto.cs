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
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Bin { get; set; } = string.Empty;
        public string ShortName { get; set; } = string.Empty;
        public string Logo { get; set; } = string.Empty;
    }
}
