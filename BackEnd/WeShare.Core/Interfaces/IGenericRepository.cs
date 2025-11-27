using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Interfaces
{
    public interface IGenericRepository<T> where T : class, IEntity
    {
        Task AddAsync(T entity);
        Task<int> CountAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
        void Delete(T entity);
        Task<IEnumerable<T>> FindAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
        Task<IEnumerable<T>> GetAllAsyns();
        Task<T?> GetByIdAsync(int id);
        void Update(T entity);
    }
}
