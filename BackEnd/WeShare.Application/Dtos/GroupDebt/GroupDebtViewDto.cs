using System;
using WeShare.Application.Dtos.User;

namespace WeShare.Application.Dtos.GroupDebt
{
    public class GroupDebtViewDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public UserViewDto? FromUser { get; set; }
        public UserViewDto? ToUser { get; set; }
        public decimal Amount { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
