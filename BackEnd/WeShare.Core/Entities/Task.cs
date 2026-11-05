using System.Collections.Generic;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Task : BaseAuditableEntity
    {
        public int GroupId { get; set; }
        public int? CreatedById { get; set; }
        public DateTime? DueAt { get; set; }
        public Guid Version { get; set; } = Guid.NewGuid();
        public int? EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TaskStatusEnum Status { get; set; }
        public Event? Event { get; set; }
        public ICollection<TaskMember> TaskMembers { get; set; } = new List<TaskMember>();
    }
}
