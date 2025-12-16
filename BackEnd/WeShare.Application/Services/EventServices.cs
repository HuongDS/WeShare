using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Event;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;

namespace WeShare.Application.Services
{
    public class EventServices : IEventServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEventRepository _eventRepository;

        public EventServices(IUnitOfWork unitOfWork, IMapper mapper, IEventRepository eventRepository)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _eventRepository = eventRepository;
        }

        public async Task<EventViewDto> GetByIdAsync(int eventId)
        {
            var eventRepo = _unitOfWork.Repository<Core.Entities.Event>();
            var entity = await eventRepo.GetByIdAsync(eventId);
            if (entity == null)
            {
                throw new Exception(ErrorMessage.EVENT_NOT_FOUND);
            }
            return _mapper.Map<EventViewDto>(entity);
        }

        public async Task<IEnumerable<EventViewDto>> GetByGroupIdAsync(int groupId)
        {
            var eventRepo = _unitOfWork.Repository<Core.Entities.Event>();
            var entities = await eventRepo.FindAsync(e => e.GroupId == groupId);
            return _mapper.Map<IEnumerable<EventViewDto>>(entities);
        }

        public async Task<PageResultDto<EventViewDto>> GetAsync(int pageSize, int pageIndex, string key, DateTime? date, DateTime? time)
        {
            var result = await _eventRepository.GetWithPaginationAsync(pageSize, pageIndex, key, date, time);
            var mappedItems = _mapper.Map<List<EventViewDto>>(result.Items);
            return new PageResultDto<EventViewDto>
            {
                Items = mappedItems,
                TotalItems = result.TotalItems,
                TotalPages = result.TotalPages,
                PageSize = result.PageSize,
                PageIndex = result.PageIndex
            };
        }

        public async Task<EventViewDto> CreateEventAsync(EventCreateDto data)
        {
            var eventRepo = _unitOfWork.Repository<Core.Entities.Event>();
            var groupRepo = _unitOfWork.Repository<Core.Entities.Group>();
            var group = await groupRepo.GetByIdAsync(data.GroupId);
            if (group == null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            var taskRepo = _unitOfWork.Repository<Core.Entities.Task>();
            if (data.TaskIds != null && data.TaskIds.Count > 0)
            {
                var tasks = await taskRepo.FindAsync(t => data.TaskIds.Contains(t.Id));
                if (tasks.Count() != data.TaskIds.Count)
                {
                    throw new Exception(ErrorMessage.SOME_THING_WENT_WRONG);
                }
            }
            var newEvent = _mapper.Map<Core.Entities.Event>(data);
            await eventRepo.AddAsync(newEvent);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<EventViewDto>(newEvent);
        }

        public async Task<EventViewDto> UpdateEventAsync(EventUpdateDto data)
        {
            var entity = await _eventRepository.GetByIdAsync(data.Id);
            if (entity is null)
            {
                throw new Exception(ErrorMessage.EVENT_NOT_FOUND);
            }
            entity = _mapper.Map<Core.Entities.Event>(data);
            _eventRepository.Update(entity);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<EventViewDto>(entity);
        }

        public async Task<bool> DeleteEventAsync(int eventId)
        {
            var entity = await _eventRepository.GetByIdAsync(eventId);
            if (entity is null)
            {
                throw new Exception(ErrorMessage.EVENT_NOT_FOUND);
            }
            _eventRepository.Delete(entity);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
