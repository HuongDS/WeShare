using System;
using System.Collections.Generic;

namespace WeShare.Application.Dtos.Event
{
    public class EventCreateDto
    {
        public string? Location { get; set; }
        public DateTime? EndsAt { get; set; }
        public int GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Title
        {
            get => Name;
            set => Name = value ?? string.Empty;
        }
        public string? Description { get; set; }
        public DateTime? EventDate { get; set; }
        public DateTime? StartsAt
        {
            get => EventDate;
            set => EventDate = value;
        }
        public ICollection<int>? TaskIds { get; set; }
    }
}
