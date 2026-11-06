using System;
using System.Collections.Generic;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.Task;

namespace WeShare.Application.Dtos.Event
{
    public class EventViewDto
    {
        public Guid Version { get; set; }
        public int? CreatedById { get; set; }
        public AssigneeSummaryDto? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Location { get; set; }
        public DateTime? EndsAt { get; set; }
        public int TaskCount { get; set; }
        public int CompletedTaskCount { get; set; }
        public EventPermissionsDto Permissions { get; set; } = new();
        public int GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Title
        {
            get => Name;
            set => Name = value;
        }
        public string? Description { get; set; }
        public DateTime? EventDate { get; set; }
        public DateTime? StartsAt
        {
            get => EventDate;
            set => EventDate = value;
        }
        public ICollection<TaskViewDto> Tasks { get; set; } = new List<TaskViewDto>();
        public GroupViewDto? Group { get; set; }
        public int Id { get; set; }
    }
}
