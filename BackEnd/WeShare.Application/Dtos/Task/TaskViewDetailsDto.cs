using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Event;
using WeShare.Core.Entities;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Task
{
    public class TaskViewDetailsDto
    {
        public int Id { get; set; }
        public int? EventId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public TaskStatusEnum Status { get; set; }
        public EventViewDto? Event { get; set; }
        public IEnumerable<TaskMember> TaskMembers { get; set; }
    }
}
