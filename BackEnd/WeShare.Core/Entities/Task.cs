using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Task : IEntity
    {
        public int Id { get; set; }
        public int? EventId { get; set; }
        public int AssigneeId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public TaskStatusEnum Status { get; set; }
        public Event? Event { get; set; }
        [ForeignKey("AssigneeId")]
        public User Assignee { get; set; }
    }
}
