using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.VietQr;

namespace WeShare.Application.Interfaces
{
    public interface IBankServices
    {
        Task<List<BankDto>> GetBanksAsync();
    }
}
