using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        Task CommitTransactionAsync();
        Task<int> CompleteAsync();
        void Dispose();
        IGenericRepository<T> Repository<T>() where T : class, IEntity;
        Task RollBackTransactionAsync();
        Task StartTransactionAsync();
    }
}
