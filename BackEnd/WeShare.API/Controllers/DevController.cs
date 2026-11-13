using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeShare.Core.Dtos.Share;
using WeShare.Infrastructure;
using WeShare.Infrastructure.Data;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class DevController : ControllerBase
    {
        private readonly WeShareDbContext _context;

        public DevController(WeShareDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Seed clean, consistent, interconnected sample data across all tables.
        /// Can be triggered via POST or GET for convenience during development.
        /// </summary>
        [HttpPost("seed")]
        [HttpGet("seed")]
        public async Task<IActionResult> SeedAll()
        {
            await DbSeeder.SeedAllAsync(_context);

            return Ok(new ResponseDto<object>
            {
                Status = 200,
                Message = "Database seeded successfully with clean, interconnected development data!",
                Data = new
                {
                    Users = new[]
                    {
                        new { Email = "huong01@gmail.com", Password = "Password123!", Role = "Leader / Main Test Account" },
                        new { Email = "dangsonghuong010405@gmail.com", Password = "Password123!", Role = "Member" },
                        new { Email = "an@gmail.com", Password = "Password123!", Role = "Member" },
                        new { Email = "binh@gmail.com", Password = "Password123!", Role = "Member" },
                        new { Email = "chi@gmail.com", Password = "Password123!", Role = "Member" },
                        new { Email = "dung@gmail.com", Password = "Password123!", Role = "Member" }
                    },
                    Groups = new[]
                    {
                        new { Name = "Chuyến Đi Đà Nẵng - Hội An 🌴", Type = "Travel", InviteCode = "WS-DANANG26", Members = 5 },
                        new { Name = "Phòng Trọ 302 KTX Xanh 🏠", Type = "Club/Living", InviteCode = "WS-TRO302", Members = 3 },
                        new { Name = "CLB Cầu Lông WeShare 🏸", Type = "Club/Sport", InviteCode = "WS-BADMINTON", Members = 4 }
                    },
                    FeaturesSeeded = new[]
                    {
                        "Events & Tasks (Assigned, InProgress, Done)",
                        "Transactions & TransactionSplits (Shared expenses & Settlements)",
                        "GroupDebts (Mathematically balanced debt matrix)",
                        "TravelPlan with Hotels, Places, and TravelBudgetItems (Cost Estimation)",
                        "Proof of settlement with Google Drive links",
                        "Notifications"
                    }
                }
            });
        }
    }
}
