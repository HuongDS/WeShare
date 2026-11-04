using System.Collections.Generic;
using System.Text.Json.Serialization;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Transaction
{
    public class CreateTransactionDto
    {
        public int GroupId { get; set; }
        public int PayerId { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public int? TaskId { get; set; }
        public SplitStrategyEnum Strategy { get; set; }
        [JsonPropertyName("stategy")]
        public SplitStrategyEnum Stategy
        {
            get => Strategy;
            set => Strategy = value;
        }
        public TransactionTypeEnum Type { get; set; }
        public Dictionary<int, decimal>? SplitAmounts { get; set; }
        public List<int> DebtIds { get; set; } = new();
        public string? ReceiptUrl { get; set; }
    }
}
