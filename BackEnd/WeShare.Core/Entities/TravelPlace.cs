using System;

namespace WeShare.Core.Entities
{
    public class TravelPlace : BaseAuditableEntity
    {
        public int TravelPlanId { get; set; }
        public TravelPlan? TravelPlan { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string Category { get; set; } = "Ăn uống";
        public int? DayNumber { get; set; }
        public string? VisitTime { get; set; }
        public decimal? EstimatedCost { get; set; }
        public string? Notes { get; set; }
        public bool IsVisited { get; set; }
    }
}
