using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using WeShare.Infrastructure.Extension;

namespace WeShare.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class, IEntity
    {
        public readonly WeShareDbContext _context;
        public readonly DbSet<T> _dbSet;

        public GenericRepository(WeShareDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }
        public async Task<T?> GetByIdAsync(int id, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query.Include(include);
                }
            }
            return await query.FirstOrDefaultAsync(e => e.Id == id);
        }
        public async Task<IEnumerable<T>> GetAllAsyns(params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query.Include(include);
                }
            }
            return await query.ToListAsync();
        }
        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query.Include(include);
                }
            }
            return await query.Where(predicate).ToListAsync();
        }
        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }
        public void Update(T entity)
        {
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }
        public void Delete(T entity)
        {
            if (_context.Entry(entity).State == EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
            _dbSet.Remove(entity);
        }
        public async Task Delete(int id)
        {
            var entities = await _dbSet.Where(e => e.Id == id).ToListAsync();
            var entity = entities.FirstOrDefault();
            if (entity != null)
            {
                _dbSet.Remove(entity);
            }
        }
        public async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.CountAsync(predicate);
        }
        public async Task<PageResultDto<T>> GetPagedAsync(int pageSize, int pageIndex, Expression<Func<T, bool>> filter = null)
        {
            var query = _dbSet.AsNoTracking();
            if (filter != null)
            {
                query = query.Where(filter);
            }
            return await PaginationExtension.PaginationAsync(query, pageSize, pageIndex);
        }
        public async Task<T> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }
        public async Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
    Expression<Func<T, bool>> predicate, int pageIndex, int pageSize)
        {
            var query = _context.Set<T>().AsQueryable();

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
