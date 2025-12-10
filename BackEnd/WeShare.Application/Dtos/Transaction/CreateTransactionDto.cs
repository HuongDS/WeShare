using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        public SplitStrategyEnum Stategy { get; set; }
        public TransactionTypeEnum Type { get; set; }
        public Dictionary<int, decimal>? SplitAmounts { get; set; }
        public List<int> DebtIds { get; set; }
    }
}
