using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using WeShare.Core.Other;

namespace WeShare.Core.Interfaces
{
    public interface IGenericRepository<T> where T : class, IEntity
    {
        Task AddAsync(T entity);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
        void Delete(T entity);
        Task Delete(int id);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includes);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<IEnumerable<T>> GetAllAsync(params Expression<Func<T, object>>[] includes);
        Task<T?> GetByIdAsync(int id, params Expression<Func<T, object>>[] includes);
        Task<PageResultDto<T>> GetPagedAsync(int pageSize, int pageIndex, Expression<Func<T, bool>>? filter = null);
        Task<PageResultDto<T>> QueryPageAsync(int pageSize, int pageIndex,
            Expression<Func<T, bool>> filter, Func<IQueryable<T>, IOrderedQueryable<T>> order,
            params Expression<Func<T, object>>[] includes);
        void Update(T entity);
        Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
            Expression<Func<T, bool>> predicate,
            int pageIndex,
            int pageSize, params Expression<Func<T, object>>[] includes);
    }
}
