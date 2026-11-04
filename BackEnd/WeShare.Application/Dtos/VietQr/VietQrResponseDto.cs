using System.Collections.Generic;

namespace WeShare.Application.Dtos.VietQr
{
    public class VietQrResponseDto
    {
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public List<BankDto> Data { get; set; } = new();
    }
}
