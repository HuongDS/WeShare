using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.User;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.TaskMember
{
    public class TaskMemberViewDto
    {
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public int GroupId { get; set; }
        public TaskStatusEnum Status { get; set; }
        public UserViewDto User { get; set; }
    }
}
