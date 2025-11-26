using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Event : IEntity
    {
        public int GroupId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? Time { get; set; }
        public ICollection<Task> Tasks { get; set; }
        public Group Group { get; set; }
        public int Id { get; set; }
    }
}
