using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Core.Entities
{
    public class TaskMember
    {
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public int GroupId { get; set; }
        public TaskStatusEnum Status { get; set; }
        public Task Task { get; set; }
        public GroupMember GroupMember { get; set; }
    }
}
