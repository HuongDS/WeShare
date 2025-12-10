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
        public int Id { get; set; }
        public string Description { get; set; }
        public decimal? Amount { get; set; }
        public Dictionary<int, decimal>? SplitAmounts { get; set; }
        public SplitStrategyEnum Strategy { get; set; }
        public List<int> DebtIds { get; set; }
    }
}
