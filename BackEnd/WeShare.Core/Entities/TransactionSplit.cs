using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Core.Entities
{
    public class TransactionSplit
    {
        public int TransactionId { get; set; }
        public int DebtorId { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal OwedAmount { get; set; }
        public TransactionSplitStatusEnum Status { get; set; }
        public Transaction Transaction { get; set; }
        [ForeignKey("DebtorId")]
        public User Debtor { get; set; }
    }
}
