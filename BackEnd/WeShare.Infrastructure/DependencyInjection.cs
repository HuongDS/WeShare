using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using WeShare.Core.Interfaces;
using WeShare.Infrastructure.Repositories;
using WeShare.Infrastructure.Services;

namespace WeShare.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureDI(this IServiceCollection services)
        {
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped(typeof(IUnitOfWork), typeof(UnitOfWork));
            services.AddScoped(typeof(IGroupMemberRepository), typeof(GroupMemberRepository));
            services.AddScoped(typeof(ITransactionRepository), typeof(TransactionRepository));
            services.AddScoped(typeof(ITransactionSplitRepository), typeof(TransactionSplitRepository));
            services.AddScoped(typeof(IGroupDebtRepository), typeof(GroupDebtRepository));
            return services;
        }
    }
}
