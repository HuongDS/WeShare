using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Notification : IEntity
    {
        public int Id { get; set; }
        public int ReceiveId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public NotificationTypeEnum Type { get; set; }
        public int? RelatedTransactionId { get; set; }
        public int? RelatedGroupId { get; set; }
        public DateTime Created_At { get; set; }
        public User Receiver { get; set; }
    }
}
