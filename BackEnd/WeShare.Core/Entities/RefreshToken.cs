using System;
using System.ComponentModel.DataAnnotations.Schema;
using WeShare.Core.Interfaces;

namespace WeShare.Core.Entities
{
    public class RefreshToken : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string JwtId { get; set; } = string.Empty;
        public bool IsUsed { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpiryDate { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
