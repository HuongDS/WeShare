using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.User;

namespace WeShare.Application.Dtos.TransactionSplit
{
    public class TransactionSplitViewDto
    {
        public int TransactionId { get; set; }
        public UserViewDto Debtor { get; set; }
        public decimal OwedAmount { get; set; }
    }
}
