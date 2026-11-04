namespace WeShare.Core.Dtos.Auth
{
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string Password { get; set; } = string.Empty;
    }
}
