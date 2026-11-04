using System;
using System.Collections;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly WeShareDbContext _context;
        private Hashtable? _repositories;
        private IDbContextTransaction? _currentTransaction;

        public UnitOfWork(WeShareDbContext context)
        {
            _context = context;
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        public IGenericRepository<T> Repository<T>() where T : class, IEntity
        {
            _repositories ??= new Hashtable();

            var type = typeof(T).Name;
            if (!_repositories.ContainsKey(type))
            {
                var repositoryType = typeof(GenericRepository<>);
                var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(T)), _context);
                _repositories.Add(type, repositoryInstance);
            }

            var repo = _repositories[type] as IGenericRepository<T>;
            return repo ?? throw new InvalidOperationException($"Could not create repository for {type}");
        }

        public async Task StartTransactionAsync()
        {
            if (_currentTransaction is null)
            {
                _currentTransaction = await _context.Database.BeginTransactionAsync();
            }
        }

        public async Task RollBackTransactionAsync()
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.RollbackAsync();
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
                if (_currentTransaction != null)
                {
                    await _currentTransaction.CommitAsync();
                }
            }
            catch
            {
                await RollBackTransactionAsync();
                throw;
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.DisposeAsync();
                    _currentTransaction = null;
                }
            }
        }
    }
}
