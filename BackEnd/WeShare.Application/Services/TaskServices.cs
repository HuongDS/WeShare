using System.Text.Json;
using AutoMapper;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Interfaces;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using TaskEntity = WeShare.Core.Entities.Task;

namespace WeShare.Application.Services;
public class TaskServices : ITaskServices
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly IGroupMemberRepository _members;
    private readonly ICurrentUserService _current;
    public TaskServices(IUnitOfWork unitOfWork, IMapper mapper, IGroupMemberRepository groupMemberRepository, ICurrentUserService current)
    { _uow = unitOfWork; _mapper = mapper; _members = groupMemberRepository; _current = current; }
    private IGenericRepository<TaskEntity> Repo => _uow.Repository<TaskEntity>();
    private async Task<GroupMember> Member(int group) => await WorkflowPolicy.Member(_uow, _members, _current.GetUserId(), group);
    private async Task<TaskEntity> Load(int id, int? group = null)
    {
        var task = await Repo.GetByIdAsync(id, t => t.TaskMembers, t => t.Event!);
        if (task == null || (group.HasValue && group != task.GroupId)) throw new NotFoundException("Không tìm thấy công việc.");
        await Member(task.GroupId);
        return task;
    }
    private async System.Threading.Tasks.Task Validate(int group, string title, string? description, int? eventId, IEnumerable<int> ids, TaskStatusEnum status)
    {
        WorkflowPolicy.Text(title, description);
        if (!Enum.IsDefined(status)) throw new BusinessException(422, "INVALID_STATUS", "Trạng thái không hợp lệ.");
        var list = ids.ToList();
        var members = await _members.GetAsync(group);
        if (list.Count > 100 || list.Distinct().Count() != list.Count || list.Except(members.Select(m => m.UserId)).Any())
            throw new BusinessException(422, "INVALID_ASSIGNEES", "Người được giao phải là thành viên của nhóm và không trùng nhau.");
        if (eventId.HasValue)
        {
            var ev = await _uow.Repository<Event>().GetByIdAsync(eventId.Value);
            if (ev == null || ev.GroupId != group) throw new BusinessException(422, "EVENT_GROUP_MISMATCH", "Sự kiện không khả dụng trong nhóm hiện tại.");
        }
    }
    public Task<int> AddAsync(int userId, TaskCreateDto data) => _uow.ExecuteWorkflowAsync(async () =>
    {
        await WorkflowPolicy.Member(_uow, _members, userId, data.GroupId);
        var ids = data.AssigneeIds?.ToList() ?? new();
        await Validate(data.GroupId, data.Title, data.Description, data.EventId, ids, TaskStatusEnum.Created);
        var entity = new TaskEntity { GroupId = data.GroupId, EventId = data.EventId, Title = data.Title.Trim(),
            Description = data.Description, DueAt = data.DueAt?.ToUniversalTime(), Status = TaskStatusEnum.Created, CreatedById = userId };
        foreach (var id in ids) entity.TaskMembers.Add(new TaskMember { UserId = id, GroupId = entity.GroupId, Status = entity.Status });
        await Repo.AddAsync(entity);
        await _uow.CompleteAsync();
        return entity.Id;
    });
    public Task<int> UpdateAsync(int userId, TaskUpdateDto data) => _uow.ExecuteWorkflowAsync(async () =>
    {
        var entity = await Load(data.TaskId, data.GroupId);
        var member = await WorkflowPolicy.Member(_uow, _members, userId, entity.GroupId);
        WorkflowPolicy.Edit(member, entity.CreatedById);
        var ids = data.AssigneeIds?.ToList() ?? new();
        await Validate(entity.GroupId, data.Title, data.Description, data.EventId, ids, data.Status);
        entity.Title = data.Title.Trim(); entity.Description = data.Description; entity.Status = data.Status;
        entity.EventId = data.EventId; entity.DueAt = data.DueAt?.ToUniversalTime();
        ReplaceAssignees(entity, ids);
        await _uow.CompleteAsync();
        return entity.Id;
    });
    private static void ReplaceAssignees(TaskEntity entity, List<int> ids)
    {
        foreach (var old in entity.TaskMembers.Where(m => !ids.Contains(m.UserId)).ToList()) entity.TaskMembers.Remove(old);
        foreach (var id in ids.Except(entity.TaskMembers.Select(m => m.UserId)).ToList())
            entity.TaskMembers.Add(new TaskMember { UserId = id, GroupId = entity.GroupId, Status = entity.Status });
        foreach (var member in entity.TaskMembers) member.Status = entity.Status;
        // Force a parent write even for an assignee-only patch (concurrency token).
        entity.UpdatedAt = DateTime.UtcNow;
    }
    public async System.Threading.Tasks.Task DeleteAsync(int taskId, string? version = null, int? groupId = null)
    {
        await _uow.ExecuteWorkflowAsync(async () =>
        {
            var entity = await Load(taskId, groupId);
            WorkflowPolicy.Edit(await Member(entity.GroupId), entity.CreatedById);
            WorkflowPolicy.Version(entity.Version, version);
            if (await _uow.Repository<Transaction>().CountAsync(t => t.TaskId == taskId) > 0)
                throw new BusinessException(409, "TASK_HAS_EXPENSES", "Hãy bỏ liên kết các chi tiêu trước khi xóa công việc.");
            Repo.Delete(entity); await _uow.CompleteAsync(); return true;
        });
    }
    public async Task<TaskViewDto> GetByIdAsync(int taskId, int? groupId = null)
    {
        var entity = await Load(taskId, groupId);
        return (await Views(new[] { entity })).Single();
    }
    private async Task<List<TaskViewDto>> Views(IEnumerable<TaskEntity> entities)
    {
        var list = entities.ToList(); var ids = list.Select(t => t.Id).ToList();
        var expenses = await _uow.Repository<Transaction>().FindAsync(t => t.TaskId.HasValue && ids.Contains(t.TaskId.Value));
        var groups = list.Select(t => t.GroupId).Distinct().ToList();
        var memberMap = new Dictionary<int, List<GroupMember>>();
        foreach (var group in groups) memberMap[group] = (await _members.GetAsync(group)).ToList();
        return list.Select(t =>
        {
            var view = _mapper.Map<TaskViewDto>(t);
            var members = memberMap[t.GroupId];
            view.TaskMembers = t.TaskMembers.Select(m => {
                var gm = members.FirstOrDefault(u => u.UserId == m.UserId);
                return new AssigneeSummaryDto {
                    UserId = m.UserId,
                    DisplayName = gm?.User.FullName,
                    AvatarUrl = gm?.User.Avatar
                };
            }).ToList();
            var creator = members.FirstOrDefault(gm => gm.UserId == t.CreatedById);
            if (creator != null)
            {
                view.CreatedBy = new AssigneeSummaryDto {
                    UserId = creator.UserId,
                    DisplayName = creator.User.FullName,
                    AvatarUrl = creator.User.Avatar
                };
            }
            view.ExpenseCount = expenses.Count(e => e.TaskId == t.Id);
            var current = members.FirstOrDefault(m => m.UserId == _current.GetUserId());
            var edit = current != null && WorkflowPolicy.CanEdit(current, t.CreatedById);
            view.Permissions = new TaskPermissionsDto { CanEdit = edit, CanDelete = edit,
                CanChangeStatus = edit || (current != null && t.TaskMembers.Any(m => m.UserId == current.UserId)) };
            return view;
        }).ToList();
    }
    public async Task<PageResultDto<TaskViewDto>> GetByGroupAsync(int groupId, TaskQueryDto q)
    {
        await Member(groupId);
        return await Search(new[] { groupId }, q);
    }
    public async Task<PageResultDto<TaskViewDto>> GetAsync(int pageSize, int pageIndex, string key, TaskStatusEnum? status)
    {
        var groups = (await _members.GetGroupIdsAsync(_current.GetUserId())).ToArray();
        return await Search(groups, new TaskQueryDto { PageSize = pageSize, PageNumber = pageIndex, Search = key, Status = status });
    }
    private async Task<PageResultDto<TaskViewDto>> Search(int[] groups, TaskQueryDto q)
    {
        WorkflowPolicy.Page(q.PageSize, q.PageNumber, q.Search);
        if (q.Status.HasValue && !Enum.IsDefined(q.Status.Value)) throw new BadRequestException("Trạng thái không hợp lệ.");
        if (!new[] { "createdAt", "dueAt", "title" }.Contains(q.SortBy) || !new[] { "asc", "desc" }.Contains(q.SortDirection))
            throw new BadRequestException("Thứ tự sắp xếp không hợp lệ.");
        var search = q.Search?.Trim() ?? ""; var asc = q.SortDirection == "asc";
        var page = await Repo.QueryPageAsync(q.PageSize, q.PageNumber, t => groups.Contains(t.GroupId)
            && (search == "" || t.Title.Contains(search)) && (!q.Status.HasValue || t.Status == q.Status)
            && (!q.EventId.HasValue || t.EventId == q.EventId)
            && (!q.AssigneeId.HasValue || t.TaskMembers.Any(m => m.UserId == q.AssigneeId))
            && (!q.Linkable || t.Status != TaskStatusEnum.Canceled),
            query => q.SortBy == "title" ? (asc ? query.OrderBy(t => t.Title) : query.OrderByDescending(t => t.Title)).ThenBy(t => t.Id)
                : q.SortBy == "dueAt" ? (asc ? query.OrderBy(t => t.DueAt == null).ThenBy(t => t.DueAt) : query.OrderBy(t => t.DueAt == null).ThenByDescending(t => t.DueAt)).ThenBy(t => t.Id)
                : (asc ? query.OrderBy(t => t.CreatedAt) : query.OrderByDescending(t => t.CreatedAt)).ThenBy(t => t.Id), t => t.TaskMembers, t => t.Event!);
        return new PageResultDto<TaskViewDto> { Items = await Views(page.Items), PageIndex = page.PageIndex,
            PageSize = page.PageSize, TotalItems = page.TotalItems, TotalPages = page.TotalPages };
    }
    public Task<TaskViewDto> PatchAsync(int groupId, int taskId, JsonElement patch, string version, bool statusOnly = false) => _uow.ExecuteWorkflowAsync(async () =>
    {
        var entity = await Load(taskId, groupId); var member = await Member(groupId);
        var edit = WorkflowPolicy.CanEdit(member, entity.CreatedById);
        if (!edit && !(statusOnly && entity.TaskMembers.Any(m => m.UserId == member.UserId)))
            throw new BusinessException(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.");
        WorkflowPolicy.Version(entity.Version, version);
        PatchFields.Validate(patch, statusOnly ? new[] { "status" } : new[] { "title", "description", "eventId", "dueAt", "assigneeIds" });
        var title = PatchFields.Get(patch, "title", entity.Title)!;
        var description = PatchFields.Get<string?>(patch, "description", entity.Description);
        var eventId = PatchFields.Get<int?>(patch, "eventId", entity.EventId);
        var due = PatchFields.Get<DateTime?>(patch, "dueAt", entity.DueAt);
        var ids = PatchFields.Get(patch, "assigneeIds", entity.TaskMembers.Select(m => m.UserId).ToList());
        var status = PatchFields.Get(patch, "status", entity.Status);
        if (ids == null) throw new BusinessException(422, "INVALID_ASSIGNEES", "Danh sách người được giao không được null.");
        await Validate(groupId, title, description, eventId, ids, status);
        entity.Title = title.Trim(); entity.Description = description; entity.EventId = eventId;
        entity.DueAt = due?.ToUniversalTime(); entity.Status = status; ReplaceAssignees(entity, ids);
        await _uow.CompleteAsync(); return await GetByIdAsync(taskId, groupId);
    });
}
