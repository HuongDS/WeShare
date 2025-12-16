using System.Net;
using Microsoft.AspNetCore.Http;
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
    public class EventController : ControllerBase
    {
        private readonly IEventServices _eventServices;

        public EventController(IEventServices eventServices)
        {
            _eventServices = eventServices;
        }
        [HttpPost]
        public async Task<IActionResult> CreateEventAsync([FromBody] WeShare.Application.Dtos.Event.EventCreateDto data)
        {
            try
            {
                var res = await _eventServices.CreateEventAsync(data);
                return Ok(new ResponseDto<EventViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.CREATE_EVENT_SUCCESSFULLY,
                    Data = res,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null,
                });
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventByIdAsync([FromRoute] int id)
        {
            try
            {
                var res = await _eventServices.GetByIdAsync(id);
                return Ok(new ResponseDto<EventViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                    Data = res,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null,
                });
            }
        }
        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetEventByGroupIdAsync([FromRoute] int groupId)
        {
            try
            {
                var res = await _eventServices.GetByGroupIdAsync(groupId);
                return Ok(new ResponseDto<IEnumerable<EventViewDto>>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                    Data = res,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null,
                });
            }
        }
        [HttpGet("search")]
        public async Task<IActionResult> GetAsync(
            [FromQuery] int pageSize,
            [FromQuery] int pageIndex,
            [FromQuery] string? key,
            [FromQuery] DateTime? date,
            [FromQuery] DateTime? time)
        {
            try
            {
                var res = await _eventServices.GetAsync(pageSize, pageIndex, key, date, time);
                return Ok(new ResponseDto<PageResultDto<EventViewDto>>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_EVENT_SUCCESSFULLY,
                    Data = res,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null,
                });
            }
        }
        [HttpPut]
        public async Task<IActionResult> UpdateEventAsync([FromBody] WeShare.Application.Dtos.Event.EventUpdateDto data)
        {
            try
            {
                var res = await _eventServices.UpdateEventAsync(data);
                return Ok(new ResponseDto<EventViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.UPDATE_EVENT_SUCCESSFULLY,
                    Data = res,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null,
                });
            }
        }
        [HttpDelete("{eventId}")]
        public async Task<IActionResult> DeleteEventAsync([FromRoute] int eventId)
        {
            try
            {
                var res = await _eventServices.DeleteEventAsync(eventId);
                return Ok(new ResponseDto<bool>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.DELETE_EVENT_SUCCESSFULLY,
                    Data = res,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null,
                });
            }
        }
    }
}
