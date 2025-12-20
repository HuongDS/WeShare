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
        Task Delete(int id);
        Task<IEnumerable<T>> FindAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
        Task<IEnumerable<T>> GetAllAsyns();
        Task<T?> GetByIdAsync(int id);
        Task<Other.PageResultDto<T>> GetPagedAsync(int pageSize, int pageIndex, System.Linq.Expressions.Expression<Func<T, bool>> filter = null);
        void Update(T entity);
    }
}
