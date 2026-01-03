using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
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
            services.AddScoped<IGroupServices, GroupServices>();
            services.AddScoped<IUserServices, UserServices>();
            services.AddScoped<ITransactionServices, TransactionServices>();
            services.AddScoped<ITransactionSplitServices, TransactionSplitServices>();
            services.AddScoped<IEventServices, EventServices>();
            services.AddScoped<ITaskServices, TaskServices>();
            services.AddScoped<IEmailServices, EmailServices>();
            services.AddScoped<ICacheServices, CacheServices>();
            return services;
        }
    }
}
