using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
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
        [Column("Created_At")]
        public DateTime? CreatedAt { get; set; }
        [NotMapped]
        public DateTime? Created_At { get => CreatedAt; set => CreatedAt = value; }
        public SplitStrategyEnum SplitStrategy { get; set; }
        public TransactionTypeEnum Type { get; set; }
        public TransactionPaymentTypeEnum PaymentType { get; set; }
        public string? ProofUrl { get; set; }
        public TransactionStatusEnum Status { get; set; }
        public Group Group { get; set; } = null!;

        [ForeignKey("PayerId")]
        public User Payer { get; set; } = null!;
        public ICollection<TransactionSplit> TransactionSplits { get; set; } = new List<TransactionSplit>();
    }
}
