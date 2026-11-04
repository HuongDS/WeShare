using System.ComponentModel.DataAnnotations.Schema;

namespace WeShare.Core.Entities
{
    public class TransactionSplit
    {
        public int TransactionId { get; set; }
        public int DebtorId { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal OwedAmount { get; set; }
        public Transaction Transaction { get; set; } = null!;
        [ForeignKey("DebtorId")]
        public User Debtor { get; set; } = null!;
    }
}
