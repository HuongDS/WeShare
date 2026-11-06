using System;
using System.Collections.Generic;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Event : BaseAuditableEntity
    {
        public int GroupId { get; set; }
        public int? CreatedById { get; set; }
        public string? Location { get; set; }
        public DateTime? EndsAt { get; set; }
        public Guid Version { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        /// <summary>Scheduled date and time of the event (UTC).</summary>
        public DateTime? EventDate { get; set; }
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
        public Group Group { get; set; } = null!;
    }
}
