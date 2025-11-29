using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Google.Apis.Auth;
using WeShare.Application.Interfaces;

namespace WeShare.Application.Validators
{
    public class GoogleValidator : IGoogleValidator
    {
        public async Task<GoogleJsonWebSignature.Payload> ValidateAsync(string token)
        {
            return await GoogleJsonWebSignature.ValidateAsync(token);
        }
    }
}
