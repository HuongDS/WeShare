using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;

namespace WeShare.Core.Interfaces
{
    public interface IGroupDebtRepository : IGenericRepository<GroupDebt>
    {
        System.Threading.Tasks.Task SyncGroupDebtAsync(int groupId, int fromUserId, int toUserId, decimal amountDelta);
    }
}
