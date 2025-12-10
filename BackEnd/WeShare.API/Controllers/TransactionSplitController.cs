using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Interfaces;
using WeShare.Application.Services;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionSplitController : ControllerBase
    {
        private readonly ITransactionSplitServices _transactionSplitServices;

        public TransactionSplitController(ITransactionSplitServices transactionSplitServices)
        {
            _transactionSplitServices = transactionSplitServices;
        }

    }
}
