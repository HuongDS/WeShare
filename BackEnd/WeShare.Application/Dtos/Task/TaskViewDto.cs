using System;
using System.Collections.Generic;
using WeShare.Core.Enums;

namespace WeShare.Application.Dtos.Task;

public class TaskViewDto
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int? EventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatusEnum Status { get; set; }
    public DateTime? DueAt { get; set; }
    public Guid Version { get; set; }
    public int? CreatedById { get; set; }
    public AssigneeSummaryDto? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public EventSummaryDto? Event { get; set; }
    public IEnumerable<AssigneeSummaryDto> TaskMembers { get; set; } = new List<AssigneeSummaryDto>();
    public IEnumerable<AssigneeSummaryDto> Assignees => TaskMembers;
    public int ExpenseCount { get; set; }
    public TaskPermissionsDto Permissions { get; set; } = new();
}

public class EventSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
}

public class AssigneeSummaryDto
{
    public int UserId { get; set; }
    public string Id => UserId.ToString();
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}

public class TaskPermissionsDto
{
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanChangeStatus { get; set; }
}
