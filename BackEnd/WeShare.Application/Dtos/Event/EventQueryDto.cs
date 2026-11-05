namespace WeShare.Application.Dtos.Event;
public class EventQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
