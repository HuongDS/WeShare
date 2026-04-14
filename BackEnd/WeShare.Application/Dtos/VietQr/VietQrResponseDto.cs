using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.VietQr
{
    public class VietQrResponseDto
    {
        public string Code { get; set; }
        public string Desc { get; set; }
        public List<BankDto> Data { get; set; }
    }
}
