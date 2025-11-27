using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;

namespace WeShare.Infrastructure
{
    public class WeShareDbContext : DbContext
    {
        public WeShareDbContext(DbContextOptions<WeShareDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupDebt> GroupDebts { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<WeShare.Core.Entities.Task> Tasks { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<TransactionSplit> TransactionSplits { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
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
            });

            modelBuilder.Entity<Event>(e =>
            {
                e.HasOne(ev => ev.Group)
                 .WithMany(g => g.Events)
                 .HasForeignKey(ev => ev.GroupId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<WeShare.Core.Entities.Task>(e =>
            {
                e.HasOne(t => t.Event)
                 .WithMany(ev => ev.Tasks)
                 .HasForeignKey(t => t.EventId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(t => t.Assignee)
                 .WithMany()
                 .HasForeignKey(t => t.AssigneeId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(rt => rt.Id);

                entity.HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
