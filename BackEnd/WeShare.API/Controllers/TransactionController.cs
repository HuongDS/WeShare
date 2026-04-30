using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Transaction;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;
using WeShare.Core.Entities;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionServices _transactionServices;
        private readonly ICurrentUserService _currentUserService;
        private readonly IFileServices _fileServices;

        public TransactionController(ITransactionServices transactionServices, ICurrentUserService currentUserService,
            IFileServices fileServices)
        {
            _transactionServices = transactionServices;
            _currentUserService = currentUserService;
            _fileServices = fileServices;
        }
        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] CreateTransactionDto data)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _transactionServices.CreateTransactionAsync(userId, data);
            return Ok(new ResponseDto<TransactionViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.ADD_TRANSACTION_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpGet("{transactionId}/is-payer")]
        public async Task<IActionResult> IsUserPayerOfTransaction([FromRoute] int transactionId)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _transactionServices.IsUserPayerOfTransactionAsync(userId, transactionId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.CHECK_USER_PAYER_OF_TRANSACTION_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPut]
        public async Task<IActionResult> UpdateTransaction([FromBody] UpdateTransactionDto data)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _transactionServices.UpdateTransactionAsync(userId, data);
            return Ok(new ResponseDto<TransactionViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPDATE_TRANSACTION_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpGet("{transactionId}")]
        public async Task<IActionResult> GetTransactionDetails([FromRoute] int transactionId)
        {
            var res = await _transactionServices.GetTransactionDetailsAsync(transactionId);
            return Ok(new ResponseDto<TransactionViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_TRANSACTION_DETAIL_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetTransactionsByGroupId([FromRoute] int groupId, [FromQuery] int pageSize, [FromQuery] int pageIndex)
        {
            var res = await _transactionServices.GetTransactionsByGroupIdAsync(groupId, pageSize, pageIndex);
            return Ok(new ResponseDto<PageResultDto<TransactionViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_TRANSACTIONS_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpGet("me")]
        public async Task<IActionResult> GetTransactionsByPayerId([FromQuery] int pageSize, [FromQuery] int pageIndex)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _transactionServices.GetTransactionsByPayerIdAsync(userId, pageSize, pageIndex);
            return Ok(new ResponseDto<PageResultDto<TransactionViewDto>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.GET_TRANSACTIONS_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpDelete("{transactionId}")]
        public async Task<IActionResult> DeleteTransaction([FromRoute] int transactionId)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _transactionServices.DeleteTransactionAsync(userId, transactionId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.DELETE_TRANSACTION_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPost("single-settlement")]
        public async Task<IActionResult> AddSettlement([FromBody] CreateSettlementDto data)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _transactionServices.CreateSingleSettlementAsync(userId, data);
            return Ok(new ResponseDto<int>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.ADD_SETTLEMENT_SUCCESSFULLY,
                Data = res
            });
        }

        [HttpPost("multi-settlement")]
        public async Task<IActionResult> AddSettlement([FromBody] List<CreateSettlementDto> data)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _transactionServices.CreateMultiSettlementAsyc(userId, data);
            return Ok(new ResponseDto<IEnumerable<int>>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.ADD_SETTLEMENTS_SUCCESSFULLY,
                Data = res
            });
        }
        [HttpPost("upload-proof")]
        public async Task<IActionResult> UploadProof(IFormFile file)
        {
            var userId = _currentUserService.GetUserId();
            var res = await _fileServices.UploadImageAsync(file, "WeShare/proof");
            return Ok(new ResponseDto<string>
            {
                Status = (int)HttpStatusCode.OK,
                Message = SuccessMessage.UPLOAD_PROOF_SUCCESSFULLY,
                Data = res.Url
            });
        }
    }
}