using System;
using System.Threading.Tasks;

namespace WeShare.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        Task CommitTransactionAsync();
        Task<int> CompleteAsync();
        IGenericRepository<T> Repository<T>() where T : class, IEntity;
        Task RollBackTransactionAsync();
        Task StartTransactionAsync();
    }
}
