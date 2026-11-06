using WeShare.Core.Enums;
namespace WeShare.Application.Dtos.Task;
public class TaskQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public TaskStatusEnum? Status { get; set; }
    public int? EventId { get; set; }
    public int? AssigneeId { get; set; }
    public bool Linkable { get; set; }
    public string SortBy { get; set; } = "createdAt";
    public string SortDirection { get; set; } = "desc";
}
