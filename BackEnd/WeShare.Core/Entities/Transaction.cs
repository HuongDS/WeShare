using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Transaction : BaseAuditableEntity
    {
        public int GroupId { get; set; }
        public int PayerId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public int? TaskId { get; set; }
        public Task? Task { get; set; }
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
