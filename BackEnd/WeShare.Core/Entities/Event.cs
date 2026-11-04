using System;
using System.Collections.Generic;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Event : IEntity
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? Time { get; set; }
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
        public Group Group { get; set; } = null!;
    }
}
