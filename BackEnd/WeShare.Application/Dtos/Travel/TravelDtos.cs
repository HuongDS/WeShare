using System;
using System.Collections.Generic;

namespace WeShare.Application.Dtos.Travel
{
    public class TravelPlanViewDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string Destination { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? EstimatedBudget { get; set; }
        public string? Notes { get; set; }
        public List<TravelHotelDto> Hotels { get; set; } = new();
        public List<TravelPlaceDto> Places { get; set; } = new();
    }

    public class TravelPlanCreateOrUpdateDto
    {
        public int GroupId { get; set; }
        public string Destination { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? EstimatedBudget { get; set; }
        public string? Notes { get; set; }
    }

    public class TravelHotelDto
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public decimal? Price { get; set; }
        public string? PhoneNumber { get; set; }
        public string? BookingUrl { get; set; }
        public string? Notes { get; set; }
    }

    public class TravelHotelCreateOrUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public decimal? Price { get; set; }
        public string? PhoneNumber { get; set; }
        public string? BookingUrl { get; set; }
        public string? Notes { get; set; }
    }

    public class TravelPlaceDto
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string Category { get; set; } = "Ăn uống";
        public int? DayNumber { get; set; }
        public string? VisitTime { get; set; }
        public decimal? EstimatedCost { get; set; }
        public string? Notes { get; set; }
        public bool IsVisited { get; set; }
    }

    public class TravelPlaceCreateOrUpdateDto
    {
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
