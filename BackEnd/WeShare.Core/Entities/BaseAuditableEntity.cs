using System;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    /// <summary>
    /// Base class for entities that track creation/modification time and soft deletion.
    /// Values are set automatically by WeShareDbContext.SaveChanges (UTC).
    /// </summary>
    public abstract class BaseAuditableEntity : IEntity, ISoftDeletable
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
