using System;

namespace WeShare.Core.Entities
{
    public class TravelHotel : BaseAuditableEntity
    {
        public int TravelPlanId { get; set; }
        public TravelPlan? TravelPlan { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public decimal? Price { get; set; }
        public string? PhoneNumber { get; set; }
        public string? BookingUrl { get; set; }
        public string? Notes { get; set; }
    }
}
