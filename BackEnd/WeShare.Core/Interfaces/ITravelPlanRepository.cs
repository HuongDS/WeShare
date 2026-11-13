using System.Threading.Tasks;
using WeShare.Core.Entities;

namespace WeShare.Core.Interfaces
{
    public interface ITravelPlanRepository : IGenericRepository<TravelPlan>
    {
        Task<TravelPlan?> GetByGroupIdWithDetailsAsync(int groupId);
    }
}
