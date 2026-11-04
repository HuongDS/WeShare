using System;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;

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

                e.HasIndex(t => t.GroupId);
                e.HasIndex(t => t.PayerId);
                e.HasIndex(t => t.CreatedAt);
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

                e.HasIndex(ev => ev.GroupId);
            });

            modelBuilder.Entity<WeShare.Core.Entities.Task>(e =>
            {
                e.HasOne(t => t.Event)
                 .WithMany(ev => ev.Tasks)
                 .HasForeignKey(t => t.EventId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(t => t.EventId);
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
        }
    }
}
