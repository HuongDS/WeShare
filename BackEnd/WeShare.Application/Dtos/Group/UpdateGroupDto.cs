using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Group
{
    public class UpdateGroupDto
    {
        public int GroupId { get; set; }
        public GroupTypeEnum Type { get; set; }
        public string Name { get; set; }
    }
}
