using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WeShare.Application.Dtos.Travel;
using WeShare.Application.Interfaces;
using WeShare.Core.Dtos.Share;

namespace WeShare.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TravelPlanController : ControllerBase
    {
        private readonly ITravelPlanServices _travelPlanServices;

        public TravelPlanController(ITravelPlanServices travelPlanServices)
        {
            _travelPlanServices = travelPlanServices;
        }

        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetByGroupIdAsync([FromRoute] int groupId)
        {
            var res = await _travelPlanServices.GetByGroupIdAsync(groupId);
            return Ok(new ResponseDto<TravelPlanViewDto?>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Get travel plan successfully.",
                Data = res
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdatePlanAsync([FromBody] TravelPlanCreateOrUpdateDto dto)
        {
            var res = await _travelPlanServices.CreateOrUpdatePlanAsync(dto);
            return Ok(new ResponseDto<TravelPlanViewDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Travel plan saved successfully.",
                Data = res
            });
        }

        [HttpPost("{travelPlanId}/hotels")]
        public async Task<IActionResult> AddHotelAsync([FromRoute] int travelPlanId, [FromBody] TravelHotelCreateOrUpdateDto dto)
        {
            var res = await _travelPlanServices.AddHotelAsync(travelPlanId, dto);
            return Ok(new ResponseDto<TravelHotelDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Hotel added successfully.",
                Data = res
            });
        }

        [HttpPut("hotels/{hotelId}")]
        public async Task<IActionResult> UpdateHotelAsync([FromRoute] int hotelId, [FromBody] TravelHotelCreateOrUpdateDto dto)
        {
            var res = await _travelPlanServices.UpdateHotelAsync(hotelId, dto);
            return Ok(new ResponseDto<TravelHotelDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Hotel updated successfully.",
                Data = res
            });
        }

        [HttpDelete("hotels/{hotelId}")]
        public async Task<IActionResult> DeleteHotelAsync([FromRoute] int hotelId)
        {
            var res = await _travelPlanServices.DeleteHotelAsync(hotelId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Hotel deleted successfully.",
                Data = res
            });
        }

        [HttpPost("{travelPlanId}/places")]
        public async Task<IActionResult> AddPlaceAsync([FromRoute] int travelPlanId, [FromBody] TravelPlaceCreateOrUpdateDto dto)
        {
            var res = await _travelPlanServices.AddPlaceAsync(travelPlanId, dto);
            return Ok(new ResponseDto<TravelPlaceDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Place added successfully.",
                Data = res
            });
        }

        [HttpPut("places/{placeId}")]
        public async Task<IActionResult> UpdatePlaceAsync([FromRoute] int placeId, [FromBody] TravelPlaceCreateOrUpdateDto dto)
        {
            var res = await _travelPlanServices.UpdatePlaceAsync(placeId, dto);
            return Ok(new ResponseDto<TravelPlaceDto>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Place updated successfully.",
                Data = res
            });
        }

        [HttpPatch("places/{placeId}/toggle-visit")]
        public async Task<IActionResult> TogglePlaceVisitedAsync([FromRoute] int placeId)
        {
            var res = await _travelPlanServices.TogglePlaceVisitedAsync(placeId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Place visited status updated.",
                Data = res
            });
        }

        [HttpDelete("places/{placeId}")]
        public async Task<IActionResult> DeletePlaceAsync([FromRoute] int placeId)
        {
            var res = await _travelPlanServices.DeletePlaceAsync(placeId);
            return Ok(new ResponseDto<bool>
            {
                Status = (int)HttpStatusCode.OK,
                Message = "Place deleted successfully.",
                Data = res
            });
        }
    }
}
