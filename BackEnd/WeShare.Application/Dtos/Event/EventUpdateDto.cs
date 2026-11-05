using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Application.Dtos.Event
{
    public class EventUpdateDto
    {
        public string? Location { get; set; }
        public DateTime? EndsAt { get; set; }
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? EventDate { get; set; }
    }
}
