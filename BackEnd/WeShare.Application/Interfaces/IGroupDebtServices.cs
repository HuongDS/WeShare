using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.GroupDebt;

namespace WeShare.Application.Interfaces
{
    public interface IGroupDebtServices
    {
        Task<IEnumerable<GroupDebtViewDto>> GetGroupDebtsThatIOweAsync(int userId, int groupId);
        Task<IEnumerable<GroupDebtViewDto>> GetMyDebtsAsync(int userId, int groupId);
    }
}
