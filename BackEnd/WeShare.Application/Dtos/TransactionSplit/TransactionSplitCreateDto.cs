using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.TransactionSplit
{
    public class TransactionSplitCreateDto
    {
        public int TransactionId { get; set; }
        public int DebtorId { get; set; }
        public decimal Amount { get; set; }
        public TransactionStatusEnum Status { get; set; } = TransactionStatusEnum.NONE;
    }
}
