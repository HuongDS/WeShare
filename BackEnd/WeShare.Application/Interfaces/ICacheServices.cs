using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Interfaces
{
    public interface ICacheServices
    {
        Task<string> GetAsync(string email);
        Task RemoveAsync(string email);
        Task SetAsync(string toEmail, string value, int expireMins);
    }
}
