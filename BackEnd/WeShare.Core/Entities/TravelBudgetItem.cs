using System;

namespace WeShare.Core.Entities
{
    public class TravelBudgetItem : BaseAuditableEntity
    {
        public int TravelPlanId { get; set; }
        public TravelPlan? TravelPlan { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = "Di chuyển";
        public decimal UnitCost { get; set; }
        public int Quantity { get; set; } = 1;
        public string? Notes { get; set; }
    }
}
