using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure.Repositories
{
    public class GroupDebtRepository : GenericRepository<GroupDebt>, IGroupDebtRepository
    {
        public GroupDebtRepository(WeShareDbContext context) : base(context)
        {
        }
        public async System.Threading.Tasks.Task SyncGroupDebtAsync(int groupId, int fromUserId, int toUserId, decimal amountDelta)
        {
            var entity = await _context.GroupDebts
                .FirstOrDefaultAsync(gd => gd.GroupId == groupId && gd.FromUserId == fromUserId && gd.ToUserId == toUserId);
            if (entity is null)
            {
                entity = new GroupDebt
                {
                    GroupId = groupId,
                    FromUserId = fromUserId,
                    ToUserId = toUserId,
                    Amount = amountDelta,
                    Updated_At = DateTime.UtcNow
                };
                await _context.GroupDebts.AddAsync(entity);
            }
            else
            {
                entity.Amount += amountDelta;
                entity.Updated_At = DateTime.UtcNow;
                _context.GroupDebts.Update(entity);
            }
            if (entity.Amount <= 0)
            {
                _context.GroupDebts.Remove(entity);
            }
        }
    }
}
