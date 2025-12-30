using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Interfaces
{
    public interface IEmailServices
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlContent);
    }
}
