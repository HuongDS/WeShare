using System;
using System.Linq;
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

        /// <summary>
        /// Adds <paramref name="amountDelta"/> to what <paramref name="fromUserId"/> owes <paramref name="toUserId"/>
        /// (negative delta = repayment). Debts between a pair of users are always netted into a single row,
        /// so A->B and B->A rows never coexist.
        /// </summary>
        public async System.Threading.Tasks.Task SyncGroupDebtAsync(int groupId, int fromUserId, int toUserId, decimal amountDelta)
        {
            if (fromUserId == toUserId || amountDelta == 0) return;

            var forward = await FindPairAsync(groupId, fromUserId, toUserId);
            var reverse = await FindPairAsync(groupId, toUserId, fromUserId);

            // Positive net => fromUser owes toUser; negative net => toUser owes fromUser.
            var net = (forward?.Amount ?? 0) - (reverse?.Amount ?? 0) + amountDelta;
            var now = DateTime.UtcNow;

            if (net == 0)
            {
                if (forward != null) _context.GroupDebts.Remove(forward);
                if (reverse != null) _context.GroupDebts.Remove(reverse);
                return;
            }

            var (debtorId, creditorId, amount) = net > 0
                ? (fromUserId, toUserId, net)
                : (toUserId, fromUserId, -net);

            var keep = net > 0 ? forward : reverse;
            var drop = net > 0 ? reverse : forward;

            if (drop != null) _context.GroupDebts.Remove(drop);

            if (keep == null)
            {
                await _context.GroupDebts.AddAsync(new GroupDebt
                {
                    GroupId = groupId,
                    FromUserId = debtorId,
                    ToUserId = creditorId,
                    Amount = amount,
                    CreatedAt = now
                });
            }
            else
            {
                keep.Amount = amount;
                keep.UpdatedAt = now;
            }
        }

        private async System.Threading.Tasks.Task<GroupDebt?> FindPairAsync(int groupId, int fromUserId, int toUserId)
        {
            var tracked = _context.GroupDebts.Local.FirstOrDefault(gd =>
                gd.GroupId == groupId && gd.FromUserId == fromUserId && gd.ToUserId == toUserId
                && _context.Entry(gd).State != EntityState.Deleted);
            return tracked ?? await _context.GroupDebts.FirstOrDefaultAsync(gd =>
                gd.GroupId == groupId && gd.FromUserId == fromUserId && gd.ToUserId == toUserId);
        }
    }
}
