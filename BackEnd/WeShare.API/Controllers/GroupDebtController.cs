using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.GroupDebt;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Interfaces;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupDebtController : ControllerBase
    {
        private readonly IGroupDebtServices _groupDebtServices;
        private readonly ICurrentUserService _currentUserService;

        public GroupDebtController(IGroupDebtServices groupDebtServices, ICurrentUserService currentUserService)
        {
            _groupDebtServices = groupDebtServices;
            _currentUserService = currentUserService;
        }
        [HttpGet("me/{groupId}")]
        public async Task<IActionResult> GetGroupDebtAsync([FromRoute] int groupId)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _groupDebtServices.GetMyDebtsAsync(userId, groupId);
            return Ok(new ResponseDto<IEnumerable<GroupDebtViewDto>>
            {
                Status = (int)System.Net.HttpStatusCode.OK,
                Message = SuccessMessage.GET_GROUP_DEBTS_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpGet("my-owe/{groupId}")]
        public async Task<IActionResult> GetGroupDebtThatIOweAsync([FromRoute] int groupId)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _groupDebtServices.GetGroupDebtsThatIOweAsync(userId, groupId);
            return Ok(new ResponseDto<IEnumerable<GroupDebtViewDto>>
            {
                Status = (int)System.Net.HttpStatusCode.OK,
                Message = SuccessMessage.GET_MY_OWE_SUCCESSFULLY,
                Data = res
            });
        }
    }
}
