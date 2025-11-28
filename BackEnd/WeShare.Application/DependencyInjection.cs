using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using WeShare.Application.Interfaces;
using WeShare.Application.Validators;
using WeShare.Core.Interfaces;
using WeShare.Infrastructure.Services;

namespace WeShare.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationDI(this IServiceCollection services)
        {
            services.AddScoped<IGoogleValidator, GoogleValidator>();
            services.AddScoped<IAuthServices, AuthServices>();
            return services;
        }
    }
}
