using WeShare.Application.Dtos.Report;

namespace WeShare.Application.Interfaces
{
    public interface IReportServices
    {
        Task<GroupAnalyticsDto> GetGroupAnalyticsAsync(int groupId, int userId);
        Task<ReportFileDto> ExportGroupReportAsync(int groupId, int userId, string format);
    }
}
