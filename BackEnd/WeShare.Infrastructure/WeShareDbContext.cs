using System;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;

namespace WeShare.Infrastructure
{
    public class WeShareDbContext : DbContext
    {
        public WeShareDbContext(DbContextOptions<WeShareDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<Group> Groups { get; set; } = null!;
        public DbSet<GroupDebt> GroupDebts { get; set; } = null!;
        public DbSet<GroupMember> GroupMembers { get; set; } = null!;
        public DbSet<WeShare.Core.Entities.Task> Tasks { get; set; } = null!;
        public DbSet<Transaction> Transactions { get; set; } = null!;
        public DbSet<TransactionSplit> TransactionSplits { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<TaskMember> TaskMembers { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<TravelPlan> TravelPlans { get; set; } = null!;
        public DbSet<TravelHotel> TravelHotels { get; set; } = null!;
        public DbSet<TravelPlace> TravelPlaces { get; set; } = null!;
        public DbSet<TravelBudgetItem> TravelBudgetItems { get; set; } = null!;

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            ApplyAuditInfo();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override System.Threading.Tasks.Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, System.Threading.CancellationToken cancellationToken = default)
        {
            ApplyAuditInfo();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        private void ApplyAuditInfo()
        {
            var now = DateTime.UtcNow;
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is ISoftDeletable softDeletable && entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified;
                    softDeletable.IsDeleted = true;
                    softDeletable.DeletedAt = now;
                }

                if (entry.State == EntityState.Modified)
                {
                    if (entry.Entity is WeShare.Core.Entities.Task task) task.Version = Guid.NewGuid();
                    if (entry.Entity is Event ev) ev.Version = Guid.NewGuid();
                }
                if (entry.Entity is BaseAuditableEntity auditable)
                {
                    if (entry.State == EntityState.Added)
                    {
                        if (auditable.CreatedAt == default) auditable.CreatedAt = now;
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        entry.Property(nameof(BaseAuditableEntity.CreatedAt)).IsModified = false;
                        auditable.UpdatedAt = now;
                    }
                }
                else if (entry.Entity is GroupDebt debt)
                {
                    if (entry.State == EntityState.Added && debt.CreatedAt == default) debt.CreatedAt = now;
                    else if (entry.State == EntityState.Modified) debt.UpdatedAt = now;
                }
                else if (entry.Entity is GroupMember member && entry.State == EntityState.Added && member.JoinedAt == default)
                {
                    member.JoinedAt = now;
                }
            }
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(u =>
            {
                u.Property(x => x.FullName).IsRequired().HasMaxLength(100);
                u.Property(x => x.Email).IsRequired().HasMaxLength(150);
                u.HasIndex(x => x.Email).IsUnique();
                u.HasQueryFilter(x => !x.IsDeleted);
                u.HasIndex(x => x.IsDeleted);
            });

            modelBuilder.Entity<GroupMember>(e =>
            {
                e.HasKey(gm => new { gm.UserId, gm.GroupId });

                e.HasOne(gm => gm.User)
                 .WithMany(u => u.GroupMembers)
                 .HasForeignKey(gm => gm.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(gm => gm.Group)
                 .WithMany(g => g.GroupMembers)
                 .HasForeignKey(gm => gm.GroupId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(gm => gm.GroupId);
            });

            modelBuilder.Entity<TransactionSplit>(e =>
            {
                e.HasKey(ts => new { ts.TransactionId, ts.DebtorId });

                e.HasOne(ts => ts.Transaction)
                 .WithMany(t => t.TransactionSplits)
                 .HasForeignKey(ts => ts.TransactionId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(ts => ts.Debtor)
                 .WithMany()
                 .HasForeignKey(ts => ts.DebtorId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(ts => ts.DebtorId);
                e.ToTable(tb => tb.HasCheckConstraint("CK_TransactionSplits_OwedAmount", "\"OwedAmount\" >= 0"));
            });

            modelBuilder.Entity<Transaction>(e =>
            {
                e.HasOne(t => t.Group)
                 .WithMany(g => g.Transactions)
                 .HasForeignKey(t => t.GroupId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(t => t.Payer)
                 .WithMany()
                 .HasForeignKey(t => t.PayerId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(t => t.Task).WithMany().HasForeignKey(t => t.TaskId).OnDelete(DeleteBehavior.Restrict);
                e.HasIndex(t => t.TaskId);
                e.HasIndex(t => t.GroupId);
                e.HasIndex(t => t.PayerId);
                e.HasIndex(t => t.CreatedAt);
                e.HasQueryFilter(t => !t.IsDeleted);
                e.HasIndex(t => t.IsDeleted);
                e.ToTable(tb => tb.HasCheckConstraint("CK_Transactions_Amount", "\"Amount\" > 0"));
            });

            modelBuilder.Entity<GroupDebt>(e =>
            {
                e.HasOne(gd => gd.Group)
                 .WithMany(g => g.GroupDebts)
                 .HasForeignKey(gd => gd.GroupId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(gd => gd.FromUser)
                 .WithMany()
                 .HasForeignKey(gd => gd.FromUserId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(gd => gd.ToUser)
                 .WithMany()
                 .HasForeignKey(gd => gd.ToUserId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(gd => new { gd.GroupId, gd.FromUserId, gd.ToUserId }).IsUnique();
                e.ToTable(tb =>
                {
                    tb.HasCheckConstraint("CK_GroupDebts_Amount", "\"Amount\" > 0");
                    tb.HasCheckConstraint("CK_GroupDebts_Users", "\"FromUserId\" <> \"ToUserId\"");
                });
            });

            modelBuilder.Entity<Event>(e =>
            {
                e.HasOne(ev => ev.Group)
                 .WithMany(g => g.Events)
                 .HasForeignKey(ev => ev.GroupId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.Property(ev => ev.Version).IsConcurrencyToken();
                e.Property(ev => ev.Name).HasMaxLength(200);
                e.Property(ev => ev.Description).HasMaxLength(5000);
                e.Property(ev => ev.Location).HasMaxLength(500);
                e.HasIndex(ev => new { ev.GroupId, ev.EventDate });
                e.HasIndex(ev => ev.GroupId);
                e.HasQueryFilter(ev => !ev.IsDeleted);
                e.HasIndex(ev => ev.IsDeleted);
            });

            modelBuilder.Entity<WeShare.Core.Entities.Task>(e =>
            {
                e.HasOne(t => t.Event)
                 .WithMany(ev => ev.Tasks)
                 .HasForeignKey(t => t.EventId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne<Group>().WithMany().HasForeignKey(t => t.GroupId).OnDelete(DeleteBehavior.Restrict);
                e.Property(t => t.Version).IsConcurrencyToken();
                e.Property(t => t.Title).HasMaxLength(200);
                e.Property(t => t.Description).HasMaxLength(5000);
                e.HasIndex(t => new { t.GroupId, t.Status, t.DueAt });

                e.HasIndex(t => t.EventId);
                e.HasQueryFilter(t => !t.IsDeleted);
                e.HasIndex(t => t.IsDeleted);
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(rt => rt.Id);

                entity.HasOne(rt => rt.User)
                 .WithMany()
                 .HasForeignKey(rt => rt.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(rt => rt.Token).IsUnique();
                entity.HasIndex(rt => rt.UserId);
            });

            modelBuilder.Entity<Group>(g =>
            {
                g.Property(x => x.Name).IsRequired().HasMaxLength(100);
                g.Property(x => x.Description).HasMaxLength(500);
                g.Property(x => x.InviteCode).HasMaxLength(50);
                g.HasIndex(x => x.InviteCode).IsUnique();
                g.HasQueryFilter(x => !x.IsDeleted);
                g.HasIndex(x => x.IsDeleted);
            });

            modelBuilder.Entity<TaskMember>(e =>
            {
                e.HasKey(tm => new { tm.TaskId, tm.UserId, tm.GroupId });

                e.HasOne(tm => tm.Task)
                 .WithMany(t => t.TaskMembers)
                 .HasForeignKey(tm => tm.TaskId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(tm => tm.GroupMember)
                 .WithMany(g => g.TaskMembers)
                 .HasForeignKey(tm => new { tm.UserId, tm.GroupId })
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Notification>(n =>
            {
                n.HasKey(no => no.Id);

                n.Property(n => n.Title).IsRequired().HasMaxLength(100);
                n.Property(n => n.Message).IsRequired().HasMaxLength(500);
                n.Property(n => n.IsRead).HasDefaultValue(false);
                n.HasOne(no => no.Receiver)
                    .WithMany()
                    .HasForeignKey(no => no.ReceiveId)
                    .OnDelete(DeleteBehavior.Cascade);

                n.HasIndex(no => new { no.ReceiveId, no.IsRead });
            });

            modelBuilder.Entity<TravelPlan>(tp =>
            {
                tp.HasKey(x => x.Id);
                tp.Property(x => x.Destination).IsRequired().HasMaxLength(200);
                tp.Property(x => x.Notes).HasMaxLength(2000);
                tp.HasOne(x => x.Group)
                  .WithMany()
                  .HasForeignKey(x => x.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);
                tp.HasQueryFilter(x => !x.IsDeleted);
                tp.HasIndex(x => x.GroupId);
            });

            modelBuilder.Entity<TravelHotel>(th =>
            {
                th.HasKey(x => x.Id);
                th.Property(x => x.Name).IsRequired().HasMaxLength(200);
                th.Property(x => x.Address).HasMaxLength(500);
                th.Property(x => x.BookingUrl).HasMaxLength(1000);
                th.Property(x => x.PhoneNumber).HasMaxLength(50);
                th.Property(x => x.Notes).HasMaxLength(2000);
                th.HasOne(x => x.TravelPlan)
                  .WithMany(tp => tp.Hotels)
                  .HasForeignKey(x => x.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
                th.HasQueryFilter(x => !x.IsDeleted);
                th.HasIndex(x => x.TravelPlanId);
            });

            modelBuilder.Entity<TravelPlace>(tp =>
            {
                tp.HasKey(x => x.Id);
                tp.Property(x => x.Name).IsRequired().HasMaxLength(200);
                tp.Property(x => x.Address).HasMaxLength(500);
                tp.Property(x => x.Category).IsRequired().HasMaxLength(100);
                tp.Property(x => x.VisitTime).HasMaxLength(100);
                tp.Property(x => x.Notes).HasMaxLength(2000);
                tp.HasOne(x => x.TravelPlan)
                  .WithMany(plan => plan.Places)
                  .HasForeignKey(x => x.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
                tp.HasQueryFilter(x => !x.IsDeleted);
                tp.HasIndex(x => x.TravelPlanId);
                tp.HasIndex(x => new { x.TravelPlanId, x.Category });
            });

            modelBuilder.Entity<TravelBudgetItem>(tb =>
            {
                tb.HasKey(x => x.Id);
                tb.Property(x => x.Name).IsRequired().HasMaxLength(200);
                tb.Property(x => x.Category).IsRequired().HasMaxLength(100);
                tb.Property(x => x.Notes).HasMaxLength(1000);
                tb.HasOne(x => x.TravelPlan)
                  .WithMany(plan => plan.BudgetItems)
                  .HasForeignKey(x => x.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
                tb.HasQueryFilter(x => !x.IsDeleted);
                tb.HasIndex(x => x.TravelPlanId);
            });
        }
    }
}
