using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Core.Entities
{
    public class Group
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public GroupTypeEnum Type { get; set; }
    }
}
