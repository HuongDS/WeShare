using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Transaction;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Other;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionServices _transactionServices;

        public TransactionController(ITransactionServices transactionServices)
        {
            _transactionServices = transactionServices;
        }
        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] WeShare.Application.Dtos.Transaction.CreateTransactionDto data)
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
                var res = await _transactionServices.CreateTransactionAsync(int.Parse(userId), data);
                return Ok(new ResponseDto<TransactionViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.ADD_TRANSACTION_SUCCESSFULLY,
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
        [HttpPost("{transactionId}")]
        public async Task<IActionResult> IsUserPayerOfTransaction([FromRoute] int transactionId)
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
                var res = await _transactionServices.IsUserPayerOfTransactionAsync(int.Parse(userId), transactionId);
                return Ok(new ResponseDto<bool>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.CHECK_USER_PAYER_OF_TRANSACTION_SUCCESSFULLY,
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
        public async Task<IActionResult> UpdateTransaction([FromBody] WeShare.Application.Dtos.Transaction.UpdateTransactionDto data)
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
                var res = await _transactionServices.UpdateTransactionAsync(int.Parse(userId), data);
                return Ok(new ResponseDto<TransactionViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.UPDATE_TRANSACTION_SUCCESSFULLY,
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
        [HttpGet("{transactionId}")]
        public async Task<IActionResult> GetTransactionDetails([FromRoute] int transactionId)
        {
            try
            {
                var res = await _transactionServices.GetTransactionDetailsAsync(transactionId);
                return Ok(new ResponseDto<TransactionViewDto>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_TRANSACTION_DETAIL_SUCCESSFULLY,
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
        [HttpGet("groupId")]
        public async Task<IActionResult> GetTransactionsByGroupId([FromQuery] int groupId, [FromQuery] int pageSize, [FromQuery] int pageIndex)
        {
            try
            {
                var res = await _transactionServices.GetTransactionsByGroupIdAsync(groupId, pageSize, pageIndex);
                return Ok(new ResponseDto<PageResultDto<TransactionViewDto>>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_TRANSACTION_DETAIL_SUCCESSFULLY,
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
        [HttpGet("payerId")]
        public async Task<IActionResult> GetTransactionsByPayerId([FromQuery] int pageSize, [FromQuery] int pageIndex)
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
                var res = await _transactionServices.GetTransactionsByPayerIdAsync(int.Parse(userId), pageSize, pageIndex);
                return Ok(new ResponseDto<PageResultDto<TransactionViewDto>>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.GET_TRANSACTION_DETAIL_SUCCESSFULLY,
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
        [HttpDelete("{transactionId}")]
        public async Task<IActionResult> DeleteTransaction([FromRoute] int transactionId)
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
                var res = await _transactionServices.DeleteTransactionAsync(int.Parse(userId), transactionId);
                return Ok(new ResponseDto<bool>
                {
                    Status = (int)HttpStatusCode.OK,
                    Message = SuccessMessage.DELETE_TRANSACTION_SUCCESSFULLY,
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