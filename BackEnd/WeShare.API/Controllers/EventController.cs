using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Event;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Other;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventServices _eventServices;

        public EventController(IEventServices eventServices)
        {
            _eventServices = eventServices;
        }

        [HttpPost]
        public async Task<IActionResult> CreateEventAsync([FromBody] EventCreateDto data)
        {
            var res = await _eventServices.CreateEventAsync(data);
            return Ok(new ResponseDto<EventViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.CREATE_EVENT_SUCCESSFULLY,
                Data = res,
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventByIdAsync([FromRoute] int id)
        {
            var res = await _eventServices.GetByIdAsync(id);
            return Ok(new ResponseDto<EventViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                Data = res,
            });
        }

        [HttpGet("/group/{groupId}")]
        [HttpGet("/api/groups/{groupId}/all-events")]
        public async Task<IActionResult> GetEventByGroupIdAsync([FromRoute] int groupId)
        {
            var res = await _eventServices.GetByGroupIdAsync(groupId);
            return Ok(new ResponseDto<IEnumerable<EventViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                Data = res,
            });
        }

        [HttpGet("search")]
        public async Task<IActionResult> GetAsync(
            [FromQuery] int pageSize,
            [FromQuery] int pageIndex,
            [FromQuery] string key = "",
            [FromQuery] DateTime? date = null)
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId is null)
            {
                return BadRequest(new ResponseDto<bool>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ErrorMessage.SOME_THING_WENT_WRONG,
                    Data = false
                });
            }
            var res = await _eventServices.GetAsync(int.Parse(userId), pageSize, pageIndex, key, date);
            return Ok(new ResponseDto<PageResultDto<EventViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                Data = res,
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateEventAsync([FromBody] EventUpdateDto data)
        {
            var res = await _eventServices.UpdateEventAsync(data);
            return Ok(new ResponseDto<EventViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_EVENT_SUCCESSFULLY,
                Data = res,
            });
        }

        [HttpDelete("{eventId}")]
        public async Task<IActionResult> DeleteEventAsync([FromRoute] int eventId)
        {
            var res = await _eventServices.DeleteEventAsync(eventId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.DELETE_EVENT_SUCCESSFULLY,
                Data = res,
            });
        }

        // --- Group-scoped REST endpoints matching FrontEnd eventApi ---
        [HttpGet("/api/groups/{groupId}/events")]
        public async Task<IActionResult> GetByGroupAsync([FromRoute] int groupId, [FromQuery] EventQueryDto query)
        {
            var res = await _eventServices.GetByGroupAsync(groupId, query);
            return Ok(new ResponseDto<PageResultDto<EventViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpGet("/api/groups/{groupId}/events/{id}")]
        public async Task<IActionResult> GetGroupEventByIdAsync([FromRoute] int groupId, [FromRoute] int id)
        {
            var res = await _eventServices.GetByIdAsync(id, groupId);
            return Ok(new ResponseDto<EventViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPost("/api/groups/{groupId}/events")]
        public async Task<IActionResult> CreateGroupEventAsync([FromRoute] int groupId, [FromBody] EventCreateDto data)
        {
            data.GroupId = groupId;
            var res = await _eventServices.CreateEventAsync(data);
            return Ok(new ResponseDto<EventViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.CREATE_EVENT_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPatch("/api/groups/{groupId}/events/{id}")]
        public async Task<IActionResult> PatchGroupEventAsync(
            [FromRoute] int groupId,
            [FromRoute] int id,
            [FromBody] JsonElement patch,
            [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            var res = await _eventServices.PatchAsync(groupId, id, patch, ifMatch ?? "");
            return Ok(new ResponseDto<EventViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_EVENT_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpDelete("/api/groups/{groupId}/events/{id}")]
        public async Task<IActionResult> DeleteGroupEventByIdAsync(
            [FromRoute] int groupId,
            [FromRoute] int id,
            [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            var res = await _eventServices.DeleteEventAsync(id, ifMatch, groupId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.DELETE_EVENT_SUCCESSFULLY,
                Data = res
            });
        }
    }
}
