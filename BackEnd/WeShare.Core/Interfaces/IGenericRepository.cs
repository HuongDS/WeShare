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
        void Delete(T entity);
        Task<IEnumerable<T>> GetAllAsyns();
        Task<T?> GetByIdAsync(int id);
        void Update(T entity);
    }
}
