using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Entities
{
    public class Transaction
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int PayerId { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public int? TaskId { get; set; }
        public DateTime? Created_At { get; set; }
    }
}
