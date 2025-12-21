using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;

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
        public async Task<IActionResult> CreateTask([FromBody] WeShare.Application.Dtos.Task.TaskCreateDto data)
        {
            try
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
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateTask([FromBody] WeShare.Application.Dtos.Task.TaskUpdateDto data)
        {
            try
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
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTask([FromRoute] int taskId)
        {
            try
            {
                await _taskServices.DeleteAsync(taskId);
                return Ok(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.DELETE_TASK_SUCCESSFULLY,
                    Data = null
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTaskById([FromRoute] int taskId)
        {
            try
            {
                var res = await _taskServices.GetByIdAsync(taskId);
                return Ok(new ResponseDto<WeShare.Application.Dtos.Task.TaskViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_TASK_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] int pageSize, [FromQuery] int pageIndex, [FromQuery] string? key, [FromQuery] WeShare.Core.Enums.TaskStatusEnum? status)
        {
            try
            {
                var res = await _taskServices.GetAsync(pageSize, pageIndex, key, status);
                return Ok(new ResponseDto<WeShare.Core.Other.PageResultDto<WeShare.Application.Dtos.Task.TaskViewDto>>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_TASKS_SUCCESSFULLY,
                    Data = res
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = (int)HttpStatusCode.BadRequest,
                    Message = ex.Message,
                    Data = null
                });
            }
        }
    }
}
