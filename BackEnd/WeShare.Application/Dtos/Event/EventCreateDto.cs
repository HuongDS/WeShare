using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.Event
{
    public class EventCreateDto
    {
        public int GroupId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? Time { get; set; }
        public ICollection<int>? TaskIds { get; set; }
    }
}
