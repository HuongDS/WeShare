using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly WeShareDbContext _context;
        private Hashtable _repositories;
        public UnitOfWork(WeShareDbContext context)
        {
            _context = context;
        }
        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
        /*
         * Just ensure design parttern of UnitOfWork.
         * In context modern WebAPI, DI usually does it at the end of each request.
         */
        public void Dispose()
        {
            _context.Dispose();
        }
        /**
         * Reflection and Caching Techniques
         */
        public IGenericRepository<T> Repository<T>() where T : class, IEntity
        {
            if (_repositories is null) _repositories = new Hashtable();

            var type = typeof(T).Name;
            if (!_repositories.ContainsKey(type))
            {
                var repositoryType = typeof(GenericRepository<>);
                var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(T)), _context);
                _repositories.Add(type, repositoryInstance);
            }

            return (IGenericRepository<T>)_repositories[type];
        }
    }
}
