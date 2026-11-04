using System;

namespace WeShare.Core.Interfaces
{
    /// <summary>
    /// Marker interface for entities that support soft deletion.
    /// When deleted, these entities are marked with IsDeleted = true and DeletedAt timestamp
    /// rather than being physically removed from the database.
    /// </summary>
    public interface ISoftDeletable
    {
        bool IsDeleted { get; set; }
        DateTime? DeletedAt { get; set; }
    }
}
