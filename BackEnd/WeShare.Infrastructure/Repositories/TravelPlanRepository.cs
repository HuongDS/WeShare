using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure.Repositories
{
    public class TravelPlanRepository : GenericRepository<TravelPlan>, ITravelPlanRepository
    {
        public TravelPlanRepository(WeShareDbContext context) : base(context)
        {
        }

        public async Task<TravelPlan?> GetByGroupIdWithDetailsAsync(int groupId)
        {
            return await _dbSet
                .Include(p => p.Hotels)
                .Include(p => p.Places)
                .FirstOrDefaultAsync(p => p.GroupId == groupId && !p.IsDeleted);
        }
    }
}
