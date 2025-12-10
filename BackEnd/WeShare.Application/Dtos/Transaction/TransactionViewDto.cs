using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Dtos.TransactionSplit;
using WeShare.Application.Dtos.User;
using WeShare.Core.Entities;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Transaction
{
    public class TransactionViewDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public UserViewDto Payer { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public TaskViewDto? Task { get; set; }
        public DateTime CreatedAt { get; set; }
        public SplitStrategyEnum SplitStrategy { get; set; }
        public IEnumerable<TransactionSplitViewDto> TransactionSplits { get; set; }
    }

}
