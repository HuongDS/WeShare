using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Dtos.Auth;

namespace WeShare.Core.Interfaces
{
    public interface IAuthServices
    {
        Task<AuthResponseDto> LoginAsync(LoginDto data);
        Task<AuthResponseDto> RegisterAsync(RegisterDto data);
    }
}
