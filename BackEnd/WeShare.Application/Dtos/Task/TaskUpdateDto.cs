using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Task
{
    public class TaskUpdateDto
    {
        public int TaskId { get; set; }
        public IEnumerable<int> AssigneeIds { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public TaskStatusEnum Status { get; set; } = TaskStatusEnum.Created;
        public int GroupId { get; set; }
    }
}
