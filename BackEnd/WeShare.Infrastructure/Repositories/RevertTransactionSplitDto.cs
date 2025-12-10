using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Infrastructure.Repositories
{
    public class RevertTransactionSplitDto
    {
        public int UserId { get; set; }
        public int GroupId { get; set; }
        public decimal Balance { get; set; }
    }
}
