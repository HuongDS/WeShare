using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.VietQr;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Dtos.Share;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BanksController : ControllerBase
    {
        private readonly IBankServices _bankServices;

        public BanksController(IBankServices bankServices)
        {
            _bankServices = bankServices;
        }
        [HttpGet]
        public async Task<IActionResult> GetBanks()
        {
            var banks = await _bankServices.GetBanksAsync();
            return Ok(new ResponseDto<List<BankDto>>
            {
                Status = 200,
                Message = SuccessMessage.GET_BANKS_SUCCESSFULLY,
                Data = banks
            });
        }
    }
}
