using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeShare.Core.Entities
{
    public class GroupDebt
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int FromUserId { get; set; }
        public int ToUserId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Updated_At { get; set; }
    }
}
