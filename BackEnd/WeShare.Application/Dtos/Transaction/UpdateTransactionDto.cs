using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Transaction
{
    public class UpdateTransactionDto
    {
        private int? _taskId;
        public int? TaskId
        {
            get => _taskId;
            set { _taskId = value; TaskIdSpecified = true; }
        }
        [System.Text.Json.Serialization.JsonIgnore]
        public bool TaskIdSpecified { get; private set; }
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
        public Dictionary<int, decimal>? SplitAmounts { get; set; }
        public SplitStrategyEnum Strategy { get; set; }
        public List<int> DebtIds { get; set; } = new();
    }
}
