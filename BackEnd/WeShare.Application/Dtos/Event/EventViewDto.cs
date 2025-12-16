using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Group;
using WeShare.Application.Dtos.Task;

namespace WeShare.Application.Dtos.Event
{
    public class EventViewDto
    {
        public int GroupId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? Time { get; set; }
        public ICollection<TaskViewDto> Tasks { get; set; }
        public GroupViewDto Group { get; set; }
        public int Id { get; set; }
    }
}
