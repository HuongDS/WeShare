using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Other;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskServices _taskServices;

        public TaskController(ITaskServices taskServices)
        {
            _taskServices = taskServices;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskCreateDto data)
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId is null)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ErrorMessage.UNAUTHORIZED_ACTION,
                    Data = null
                });
            }
            var res = await _taskServices.AddAsync(int.Parse(userId), data);
            return Ok(new ResponseDto<int>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.CREATE_TASK_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateTask([FromBody] TaskUpdateDto data)
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId is null)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ErrorMessage.UNAUTHORIZED_ACTION,
                    Data = null
                });
            }
            var res = await _taskServices.UpdateAsync(int.Parse(userId), data);
            return Ok(new ResponseDto<int>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_TASK_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTask([FromRoute] int taskId)
        {
            await _taskServices.DeleteAsync(taskId);
            return Ok(new ResponseDto<object>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.DELETE_TASK_SUCCESSFULLY,
                Data = null
            });
        }

        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTaskById([FromRoute] int taskId)
        {
            var res = await _taskServices.GetByIdAsync(taskId);
            return Ok(new ResponseDto<TaskViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_TASK_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] int pageSize, [FromQuery] int pageIndex, [FromQuery] WeShare.Core.Enums.TaskStatusEnum? status = null, [FromQuery] string? key = null)
        {
            var res = await _taskServices.GetAsync(pageSize, pageIndex, key ?? "", status);
            return Ok(new ResponseDto<PageResultDto<TaskViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_TASKS_SUCCESSFULLY,
                Data = res
            });
        }

        // --- Group-scoped REST endpoints matching FrontEnd taskApi ---
        [HttpGet("/api/groups/{groupId}/tasks")]
        public async Task<IActionResult> GetByGroupAsync([FromRoute] int groupId, [FromQuery] TaskQueryDto query)
        {
            var res = await _taskServices.GetByGroupAsync(groupId, query);
            return Ok(new ResponseDto<PageResultDto<TaskViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_TASKS_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpGet("/api/groups/{groupId}/tasks/{id}")]
        public async Task<IActionResult> GetGroupTaskByIdAsync([FromRoute] int groupId, [FromRoute] int id)
        {
            var res = await _taskServices.GetByIdAsync(id, groupId);
            return Ok(new ResponseDto<TaskViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_TASK_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPost("/api/groups/{groupId}/tasks")]
        public async Task<IActionResult> CreateGroupTaskAsync([FromRoute] int groupId, [FromBody] TaskCreateDto data)
        {
            var userId = User.FindFirst("id")?.Value;
            if (userId is null)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ErrorMessage.UNAUTHORIZED_ACTION,
                    Data = null
                });
            }
            data.GroupId = groupId;
            var taskId = await _taskServices.AddAsync(int.Parse(userId), data);
            var res = await _taskServices.GetByIdAsync(taskId, groupId);
            return Ok(new ResponseDto<TaskViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.CREATE_TASK_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPatch("/api/groups/{groupId}/tasks/{id}")]
        public async Task<IActionResult> PatchGroupTaskAsync(
            [FromRoute] int groupId,
            [FromRoute] int id,
            [FromBody] JsonElement patch,
            [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            var res = await _taskServices.PatchAsync(groupId, id, patch, ifMatch ?? "");
            return Ok(new ResponseDto<TaskViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_TASK_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPatch("/api/groups/{groupId}/tasks/{id}/status")]
        public async Task<IActionResult> PatchGroupTaskStatusAsync(
            [FromRoute] int groupId,
            [FromRoute] int id,
            [FromBody] JsonElement patch,
            [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            var res = await _taskServices.PatchAsync(groupId, id, patch, ifMatch ?? "", statusOnly: true);
            return Ok(new ResponseDto<TaskViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_TASK_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpDelete("/api/groups/{groupId}/tasks/{id}")]
        public async Task<IActionResult> DeleteGroupTaskByIdAsync(
            [FromRoute] int groupId,
            [FromRoute] int id,
            [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            await _taskServices.DeleteAsync(id, ifMatch, groupId);
            return Ok(new ResponseDto<object>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.DELETE_TASK_SUCCESSFULLY,
                Data = null
            });
        }
    }
}
