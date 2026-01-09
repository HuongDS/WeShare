using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Transaction
{
    public class CreateSettlementDto
    {
        public int GroupId { get; set; }
        public int PayerId { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public int? TaskId { get; set; }
        public int ReceiverId { get; set; }
        public string? ProofUrl { get; set; }
        public TransactionPaymentTypeEnum PaymentType { get; set; }
    }
}
