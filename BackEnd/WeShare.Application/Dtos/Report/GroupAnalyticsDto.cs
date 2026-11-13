namespace WeShare.Application.Dtos.Report
{
    public class GroupAnalyticsDto
    {
        public decimal TotalSpending { get; set; }
        public int TransactionCount { get; set; }
        public List<CategorySpendingDto> ByCategory { get; set; } = new();
        public List<MemberSpendingDto> ByMember { get; set; } = new();
    }

    public class CategorySpendingDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Count { get; set; }
    }

    public class MemberSpendingDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        /// <summary>Total amount this member paid out of pocket.</summary>
        public decimal Paid { get; set; }
        /// <summary>Total share this member owes across expenses.</summary>
        public decimal Share { get; set; }
    }
}
