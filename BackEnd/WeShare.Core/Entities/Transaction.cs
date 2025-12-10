using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Transaction : IEntity
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int PayerId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public int? TaskId { get; set; }
        public DateTime? Created_At { get; set; }
        public SplitStrategyEnum SplitStrategy { get; set; }
        public TransactionTypeEnum Type { get; set; }
        public Group Group { get; set; }

        [ForeignKey("PayerId")]
        public User Payer { get; set; }
        public ICollection<TransactionSplit> TransactionSplits { get; set; }
    }
}
