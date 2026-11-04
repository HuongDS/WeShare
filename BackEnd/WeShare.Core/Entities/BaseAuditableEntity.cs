using System;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    /// <summary>
    /// Base class for entities that track creation/modification time.
    /// Values are set automatically by WeShareDbContext.SaveChanges (UTC).
    /// </summary>
    public abstract class BaseAuditableEntity : IEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
