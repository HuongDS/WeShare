using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Report;
using WeShare.Application.Interfaces;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Interfaces;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly IReportServices _reportServices;
        private readonly ICurrentUserService _currentUserService;

        public ReportController(IReportServices reportServices, ICurrentUserService currentUserService)
        {
            _reportServices = reportServices;
            _currentUserService = currentUserService;
        }

        [HttpGet("group/{groupId}/analytics")]
        public async Task<IActionResult> GetGroupAnalyticsAsync([FromRoute] int groupId)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _reportServices.GetGroupAnalyticsAsync(groupId, userId);
            return Ok(new ResponseDto<GroupAnalyticsDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Lấy thống kê chi tiêu thành công!",
                Data = res
            });
        }

        [HttpGet("group/{groupId}/export")]
        public async Task<IActionResult> ExportGroupReportAsync([FromRoute] int groupId, [FromQuery] string format = "xlsx")
        {
            var userId = _currentUserService.GetUserId();
            var file = await _reportServices.ExportGroupReportAsync(groupId, userId, format);
            return File(file.Content, file.ContentType, file.FileName);
        }
    }
}
