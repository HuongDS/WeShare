using System;
using System.Collections.Generic;

namespace WeShare.Application.Dtos.User
{
    public class DashboardSummaryDto
    {
        public decimal TotalSpent { get; set; }
        public decimal TotalOwe { get; set; }
        public decimal TotalOwedToYou { get; set; }
        public decimal NetBalance { get; set; }
        public int TotalGroups { get; set; }
        public int PendingTasksCount { get; set; }
        public List<DashboardActivityDto> RecentActivities { get; set; } = new();
    }

    public class DashboardActivityDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // "Expense", "Payment", "Settlement", "Group", "Task"
        public decimal? Amount { get; set; }
        public string? GroupName { get; set; }
        public int? GroupId { get; set; }
        public string? PayerName { get; set; }
        public string? PayerAvatar { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
