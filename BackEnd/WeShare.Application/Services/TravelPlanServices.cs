using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WeShare.Application.Dtos.Travel;
using WeShare.Application.Interfaces;
using WeShare.Core.Entities;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services
{
    public class TravelPlanServices : ITravelPlanServices
    {
        private readonly IUnitOfWork _unitOfWork;

        public TravelPlanServices(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TravelPlanViewDto?> GetByGroupIdAsync(int groupId)
        {
            var planRepo = _unitOfWork.Repository<TravelPlan>();
            var plans = await planRepo.FindAsync(
                p => p.GroupId == groupId && !p.IsDeleted,
                p => p.Hotels,
                p => p.Places
            );

            var plan = plans.FirstOrDefault();
            if (plan == null)
            {
                return null;
            }

            return MapToViewDto(plan);
        }

        public async Task<TravelPlanViewDto> CreateOrUpdatePlanAsync(TravelPlanCreateOrUpdateDto dto)
        {
            var groupRepo = _unitOfWork.Repository<Group>();
            var group = await groupRepo.GetByIdAsync(dto.GroupId);
            if (group == null)
            {
                throw new NotFoundException($"Group {dto.GroupId} does not exist.");
            }

            var planRepo = _unitOfWork.Repository<TravelPlan>();
            var existingPlans = await planRepo.FindAsync(
                p => p.GroupId == dto.GroupId && !p.IsDeleted,
                p => p.Hotels,
                p => p.Places
            );

            var plan = existingPlans.FirstOrDefault();
            if (plan == null)
            {
                plan = new TravelPlan
                {
                    GroupId = dto.GroupId,
                    Destination = dto.Destination,
                    StartDate = dto.StartDate?.ToUniversalTime(),
                    EndDate = dto.EndDate?.ToUniversalTime(),
                    EstimatedBudget = dto.EstimatedBudget,
                    Notes = dto.Notes
                };
                await planRepo.AddAsync(plan);
            }
            else
            {
                plan.Destination = dto.Destination;
                plan.StartDate = dto.StartDate?.ToUniversalTime();
                plan.EndDate = dto.EndDate?.ToUniversalTime();
                plan.EstimatedBudget = dto.EstimatedBudget;
                plan.Notes = dto.Notes;
                planRepo.Update(plan);
            }

            await _unitOfWork.CompleteAsync();
            return MapToViewDto(plan);
        }

        public async Task<TravelHotelDto> AddHotelAsync(int travelPlanId, TravelHotelCreateOrUpdateDto dto)
        {
            var planRepo = _unitOfWork.Repository<TravelPlan>();
            var plan = await planRepo.GetByIdAsync(travelPlanId);
            if (plan == null)
            {
                throw new NotFoundException($"TravelPlan {travelPlanId} does not exist.");
            }

            var hotel = new TravelHotel
            {
                TravelPlanId = travelPlanId,
                Name = dto.Name,
                Address = dto.Address,
                CheckInDate = dto.CheckInDate?.ToUniversalTime(),
                CheckOutDate = dto.CheckOutDate?.ToUniversalTime(),
                Price = dto.Price,
                PhoneNumber = dto.PhoneNumber,
                BookingUrl = dto.BookingUrl,
                Notes = dto.Notes
            };

            var hotelRepo = _unitOfWork.Repository<TravelHotel>();
            await hotelRepo.AddAsync(hotel);
            await _unitOfWork.CompleteAsync();

            return MapToHotelDto(hotel);
        }

        public async Task<TravelHotelDto> UpdateHotelAsync(int hotelId, TravelHotelCreateOrUpdateDto dto)
        {
            var hotelRepo = _unitOfWork.Repository<TravelHotel>();
            var hotel = await hotelRepo.GetByIdAsync(hotelId);
            if (hotel == null)
            {
                throw new NotFoundException($"Hotel {hotelId} does not exist.");
            }

            hotel.Name = dto.Name;
            hotel.Address = dto.Address;
            hotel.CheckInDate = dto.CheckInDate?.ToUniversalTime();
            hotel.CheckOutDate = dto.CheckOutDate?.ToUniversalTime();
            hotel.Price = dto.Price;
            hotel.PhoneNumber = dto.PhoneNumber;
            hotel.BookingUrl = dto.BookingUrl;
            hotel.Notes = dto.Notes;

            hotelRepo.Update(hotel);
            await _unitOfWork.CompleteAsync();

            return MapToHotelDto(hotel);
        }

        public async Task<bool> DeleteHotelAsync(int hotelId)
        {
            var hotelRepo = _unitOfWork.Repository<TravelHotel>();
            var hotel = await hotelRepo.GetByIdAsync(hotelId);
            if (hotel == null)
            {
                return false;
            }

            await hotelRepo.Delete(hotelId);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<TravelPlaceDto> AddPlaceAsync(int travelPlanId, TravelPlaceCreateOrUpdateDto dto)
        {
            var planRepo = _unitOfWork.Repository<TravelPlan>();
            var plan = await planRepo.GetByIdAsync(travelPlanId);
            if (plan == null)
            {
                throw new NotFoundException($"TravelPlan {travelPlanId} does not exist.");
            }

            var place = new TravelPlace
            {
                TravelPlanId = travelPlanId,
                Name = dto.Name,
                Address = dto.Address,
                Category = string.IsNullOrWhiteSpace(dto.Category) ? "Ăn uống" : dto.Category,
                DayNumber = dto.DayNumber,
                VisitTime = dto.VisitTime,
                EstimatedCost = dto.EstimatedCost,
                Notes = dto.Notes,
                IsVisited = dto.IsVisited
            };

            var placeRepo = _unitOfWork.Repository<TravelPlace>();
            await placeRepo.AddAsync(place);
            await _unitOfWork.CompleteAsync();

            return MapToPlaceDto(place);
        }

        public async Task<TravelPlaceDto> UpdatePlaceAsync(int placeId, TravelPlaceCreateOrUpdateDto dto)
        {
            var placeRepo = _unitOfWork.Repository<TravelPlace>();
            var place = await placeRepo.GetByIdAsync(placeId);
            if (place == null)
            {
                throw new NotFoundException($"Place {placeId} does not exist.");
            }

            place.Name = dto.Name;
            place.Address = dto.Address;
            place.Category = string.IsNullOrWhiteSpace(dto.Category) ? "Ăn uống" : dto.Category;
            place.DayNumber = dto.DayNumber;
            place.VisitTime = dto.VisitTime;
            place.EstimatedCost = dto.EstimatedCost;
            place.Notes = dto.Notes;
            place.IsVisited = dto.IsVisited;

            placeRepo.Update(place);
            await _unitOfWork.CompleteAsync();

            return MapToPlaceDto(place);
        }

        public async Task<bool> TogglePlaceVisitedAsync(int placeId)
        {
            var placeRepo = _unitOfWork.Repository<TravelPlace>();
            var place = await placeRepo.GetByIdAsync(placeId);
            if (place == null)
            {
                return false;
            }

            place.IsVisited = !place.IsVisited;
            placeRepo.Update(place);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> DeletePlaceAsync(int placeId)
        {
            var placeRepo = _unitOfWork.Repository<TravelPlace>();
            var place = await placeRepo.GetByIdAsync(placeId);
            if (place == null)
            {
                return false;
            }

            await placeRepo.Delete(placeId);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        private static TravelPlanViewDto MapToViewDto(TravelPlan plan)
        {
            return new TravelPlanViewDto
            {
                Id = plan.Id,
                GroupId = plan.GroupId,
                Destination = plan.Destination,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                EstimatedBudget = plan.EstimatedBudget,
                Notes = plan.Notes,
                Hotels = plan.Hotels?.Where(h => !h.IsDeleted).Select(MapToHotelDto).OrderBy(h => h.CheckInDate).ToList() ?? new List<TravelHotelDto>(),
                Places = plan.Places?.Where(p => !p.IsDeleted).Select(MapToPlaceDto).OrderBy(p => p.DayNumber ?? 999).ThenBy(p => p.Id).ToList() ?? new List<TravelPlaceDto>()
            };
        }

        private static TravelHotelDto MapToHotelDto(TravelHotel h)
        {
            return new TravelHotelDto
            {
                Id = h.Id,
                TravelPlanId = h.TravelPlanId,
                Name = h.Name,
                Address = h.Address,
                CheckInDate = h.CheckInDate,
                CheckOutDate = h.CheckOutDate,
                Price = h.Price,
                PhoneNumber = h.PhoneNumber,
                BookingUrl = h.BookingUrl,
                Notes = h.Notes
            };
        }

        private static TravelPlaceDto MapToPlaceDto(TravelPlace p)
        {
            return new TravelPlaceDto
            {
                Id = p.Id,
                TravelPlanId = p.TravelPlanId,
                Name = p.Name,
                Address = p.Address,
                Category = p.Category,
                DayNumber = p.DayNumber,
                VisitTime = p.VisitTime,
                EstimatedCost = p.EstimatedCost,
                Notes = p.Notes,
                IsVisited = p.IsVisited
            };
        }
    }
}
