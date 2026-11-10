using System.Threading.Tasks;
using WeShare.Application.Dtos.Travel;

namespace WeShare.Application.Interfaces
{
    public interface ITravelPlanServices
    {
        Task<TravelPlanViewDto?> GetByGroupIdAsync(int groupId);
        Task<TravelPlanViewDto> CreateOrUpdatePlanAsync(TravelPlanCreateOrUpdateDto dto);
        Task<TravelHotelDto> AddHotelAsync(int travelPlanId, TravelHotelCreateOrUpdateDto dto);
        Task<TravelHotelDto> UpdateHotelAsync(int hotelId, TravelHotelCreateOrUpdateDto dto);
        Task<bool> DeleteHotelAsync(int hotelId);
        Task<TravelPlaceDto> AddPlaceAsync(int travelPlanId, TravelPlaceCreateOrUpdateDto dto);
        Task<TravelPlaceDto> UpdatePlaceAsync(int placeId, TravelPlaceCreateOrUpdateDto dto);
        Task<bool> TogglePlaceVisitedAsync(int placeId);
        Task<bool> DeletePlaceAsync(int placeId);
    }
}
