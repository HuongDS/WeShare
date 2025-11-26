using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Entities
{
    public class TransactionSplit
    {
        public int TransactionId { get; set; }
        public int DebtorId { get; set; }
        public decimal OwedAmount { get; set; }
    }
}
