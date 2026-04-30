using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Entities;

namespace WeShare.Application.Dtos.GroupDebt
{
    public class GroupDebtViewDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public WeShare.Core.Entities.User FromUser { get; set; }
        public WeShare.Core.Entities.User ToUser { get; set; }
        public decimal Amount { get; set; }
        public DateTime Updated_At { get; set; }
    }
}
