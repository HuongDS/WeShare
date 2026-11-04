using System;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class Notification : IEntity
    {
        public int Id { get; set; }
        public int ReceiveId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public NotificationTypeEnum Type { get; set; }
        public int? RelatedTransactionId { get; set; }
        public int? RelatedGroupId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User Receiver { get; set; } = null!;
    }
}
