namespace WeShare.Application.Dtos.Group
{
    public class GroupInviteInfoDto
    {
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public string InviteCode { get; set; } = string.Empty;
        public string InviteUrl { get; set; } = string.Empty;
    }
}
