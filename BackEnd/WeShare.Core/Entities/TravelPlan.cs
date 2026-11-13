using System;
using System.Collections.Generic;

namespace WeShare.Core.Entities
{
    public class TravelPlan : BaseAuditableEntity
    {
        public int GroupId { get; set; }
        public Group? Group { get; set; }
        public string Destination { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? EstimatedBudget { get; set; }
        public string? Notes { get; set; }

        public ICollection<TravelHotel> Hotels { get; set; } = new List<TravelHotel>();
        public ICollection<TravelPlace> Places { get; set; } = new List<TravelPlace>();
        public ICollection<TravelBudgetItem> BudgetItems { get; set; } = new List<TravelBudgetItem>();
    }
}
