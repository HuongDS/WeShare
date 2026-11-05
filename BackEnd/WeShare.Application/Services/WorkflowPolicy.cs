using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services;

internal static class WorkflowPolicy
{
    internal static async Task<GroupMember> Member(IUnitOfWork uow, IGroupMemberRepository members, int userId, int groupId)
    {
        if (await uow.Repository<Group>().GetByIdAsync(groupId) == null)
            throw new NotFoundException("Không tìm thấy nhóm.");
        return await members.GetGroupMemberAsync(userId, groupId)
            ?? throw new NotFoundException("Không tìm thấy nhóm.");
    }
    internal static bool CanEdit(GroupMember member, int? creator) => member.Role == GroupRoleEnum.Leader || member.UserId == creator;
    internal static void Edit(GroupMember member, int? creator)
    {
        if (!CanEdit(member, creator)) throw new BusinessException(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.");
    }
    internal static void Version(Guid actual, string? expected)
    {
        if (expected == null) return; // Legacy PUT/DELETE keep their existing contract.
        if (!Guid.TryParse(expected.Trim('"'), out var value) || value != actual)
            throw new BusinessException(412, "RESOURCE_VERSION_MISMATCH", "Dữ liệu đã thay đổi. Vui lòng tải lại.");
    }
    internal static void Text(string? title, string? description)
    {
        if (string.IsNullOrWhiteSpace(title) || title.Trim().Length > 200 || description?.Length > 5000)
            throw new BusinessException(422, "INVALID_CONTENT", "Tên phải có 1–200 ký tự; mô tả tối đa 5000 ký tự.");
    }
    internal static void Page(int size, int index, string? search)
    {
        if (size < 1 || size > 100 || index < 1 || search?.Length > 200)
            throw new BadRequestException("Phân trang hoặc từ khóa không hợp lệ.");
    }
    internal static async Task<Core.Entities.Task?> Link(IUnitOfWork uow, int groupId, TransactionTypeEnum type, int? taskId, int? previous = null)
    {
        if (!taskId.HasValue) return null;
        if (type != TransactionTypeEnum.EXPENSE)
            throw new BusinessException(422, "TASK_LINK_NOT_ALLOWED", "Chỉ chi tiêu được liên kết công việc.");
        var task = await uow.Repository<Core.Entities.Task>().GetByIdAsync(taskId.Value, t => t.Event!);
        if (task == null || task.GroupId != groupId)
            throw new BusinessException(422, "TASK_GROUP_MISMATCH", "Công việc không khả dụng trong nhóm hiện tại.");
        if (task.Status == TaskStatusEnum.Canceled && previous != taskId)
            throw new BusinessException(422, "TASK_CANCELLED", "Không thể liên kết mới với công việc đã hủy.");
        return task;
    }
}
