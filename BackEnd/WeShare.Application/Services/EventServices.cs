using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Event;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;
using EventEntity = WeShare.Core.Entities.Event;

namespace WeShare.Application.Services
{
    public class EventServices : IEventServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEventRepository _eventRepository;
        private readonly IGroupMemberRepository _groupMemberRepository;
        private readonly ICurrentUserService _currentUser;

        public EventServices(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEventRepository eventRepository,
            IGroupMemberRepository groupMemberRepository,
            ICurrentUserService currentUser)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _eventRepository = eventRepository;
            _groupMemberRepository = groupMemberRepository;
            _currentUser = currentUser;
        }

        private IGenericRepository<EventEntity> Repo => _unitOfWork.Repository<EventEntity>();

        private async Task<GroupMember> Member(int groupId) =>
            await WorkflowPolicy.Member(_unitOfWork, _groupMemberRepository, _currentUser.GetUserId(), groupId);

        private async Task<EventEntity> Load(int id, int? groupId = null)
        {
            var ev = await Repo.GetByIdAsync(id, e => e.Tasks);
            if (ev == null || (groupId.HasValue && groupId != ev.GroupId))
                throw new NotFoundException("Không tìm thấy sự kiện.");
            await Member(ev.GroupId);
            return ev;
        }

        public async Task<EventViewDto> GetByIdAsync(int eventId, int? groupId = null)
        {
            var entity = await Load(eventId, groupId);
            return (await Views(new[] { entity })).Single();
        }

        public async Task<IEnumerable<EventViewDto>> GetByGroupIdAsync(int groupId)
        {
            await Member(groupId);
            var entities = await Repo.FindAsync(e => e.GroupId == groupId, e => e.Tasks);
            return await Views(entities);
        }

        public async Task<PageResultDto<EventViewDto>> GetAsync(int userId, int pageSize, int pageIndex, string key, DateTime? date)
        {
            var groupIds = await _groupMemberRepository.GetGroupIdsAsync(userId);
            var result = await _eventRepository.GetWithPaginationAsync(pageSize, pageIndex, key, date, groupIds);
            var views = await Views(result.Items);
            return new PageResultDto<EventViewDto>
            {
                Items = views,
                TotalItems = result.TotalItems,
                TotalPages = result.TotalPages,
                PageSize = result.PageSize,
                PageIndex = result.PageIndex
            };
        }

        public async Task<PageResultDto<EventViewDto>> GetByGroupAsync(int groupId, EventQueryDto query)
        {
            await Member(groupId);
            WorkflowPolicy.Page(query.PageSize, query.PageNumber, query.Search);

            if (query.From.HasValue && query.To.HasValue && query.From.Value >= query.To.Value)
                throw new BusinessException(422, "INVALID_RANGE", "Mốc kết thúc phải sau mốc bắt đầu.");

            var search = query.Search?.Trim() ?? "";
            var from = query.From?.ToUniversalTime();
            var to = query.To?.ToUniversalTime();

            var page = await Repo.QueryPageAsync(
                query.PageSize,
                query.PageNumber,
                e => e.GroupId == groupId && !e.IsDeleted
                    && (search == "" || e.Name.Contains(search))
                    && (!from.HasValue || (e.EventDate.HasValue && e.EventDate.Value >= from.Value))
                    && (!to.HasValue || (e.EndsAt.HasValue && e.EndsAt.Value <= to.Value)),
                q => q.OrderByDescending(e => e.EventDate ?? e.CreatedAt).ThenByDescending(e => e.Id),
                e => e.Tasks
            );

            return new PageResultDto<EventViewDto>
            {
                Items = await Views(page.Items),
                PageIndex = page.PageIndex,
                PageSize = page.PageSize,
                TotalItems = page.TotalItems,
                TotalPages = page.TotalPages
            };
        }

        public Task<EventViewDto> CreateEventAsync(EventCreateDto data) => _unitOfWork.ExecuteWorkflowAsync(async () =>
        {
            var currentUserId = _currentUser.GetUserId();
            var member = await WorkflowPolicy.Member(_unitOfWork, _groupMemberRepository, currentUserId, data.GroupId);

            var title = string.IsNullOrWhiteSpace(data.Name) ? (data.Title ?? "") : data.Name;
            var startsAt = data.EventDate ?? data.StartsAt;
            WorkflowPolicy.Text(title, data.Description);

            if (data.EndsAt.HasValue && startsAt.HasValue && data.EndsAt <= startsAt)
                throw new BusinessException(422, "INVALID_RANGE", "Mốc kết thúc phải sau mốc bắt đầu.");

            var newEvent = new EventEntity
            {
                GroupId = data.GroupId,
                CreatedById = currentUserId,
                Name = title.Trim(),
                Description = data.Description,
                Location = data.Location,
                EventDate = startsAt?.ToUniversalTime(),
                EndsAt = data.EndsAt?.ToUniversalTime(),
            };

            await Repo.AddAsync(newEvent);
            await _unitOfWork.CompleteAsync();

            return await GetByIdAsync(newEvent.Id, data.GroupId);
        });

        public Task<EventViewDto> UpdateEventAsync(EventUpdateDto data) => _unitOfWork.ExecuteWorkflowAsync(async () =>
        {
            var entity = await Load(data.Id);
            var member = await Member(entity.GroupId);
            WorkflowPolicy.Edit(member, entity.CreatedById);

            WorkflowPolicy.Text(data.Name, data.Description);
            if (data.EndsAt.HasValue && data.EventDate.HasValue && data.EndsAt <= data.EventDate)
                throw new BusinessException(422, "INVALID_RANGE", "Mốc kết thúc phải sau mốc bắt đầu.");

            entity.Name = data.Name.Trim();
            entity.Description = data.Description;
            entity.Location = data.Location;
            entity.EventDate = data.EventDate?.ToUniversalTime();
            entity.EndsAt = data.EndsAt?.ToUniversalTime();

            Repo.Update(entity);
            await _unitOfWork.CompleteAsync();
            return await GetByIdAsync(entity.Id, entity.GroupId);
        });

        public Task<EventViewDto> PatchAsync(int groupId, int eventId, JsonElement patch, string version) => _unitOfWork.ExecuteWorkflowAsync(async () =>
        {
            var entity = await Load(eventId, groupId);
            var member = await Member(groupId);
            WorkflowPolicy.Edit(member, entity.CreatedById);
            WorkflowPolicy.Version(entity.Version, version);

            PatchFields.Validate(patch, new[] { "title", "description", "location", "startsAt", "endsAt", "name", "eventDate" });

            var title = PatchFields.Get(patch, "title", PatchFields.Get(patch, "name", entity.Name))!;
            var description = PatchFields.Get<string?>(patch, "description", entity.Description);
            var location = PatchFields.Get<string?>(patch, "location", entity.Location);
            var startsAt = PatchFields.Get<DateTime?>(patch, "startsAt", PatchFields.Get<DateTime?>(patch, "eventDate", entity.EventDate));
            var endsAt = PatchFields.Get<DateTime?>(patch, "endsAt", entity.EndsAt);

            WorkflowPolicy.Text(title, description);
            if (startsAt.HasValue && endsAt.HasValue && endsAt <= startsAt)
                throw new BusinessException(422, "INVALID_RANGE", "Mốc kết thúc phải sau mốc bắt đầu.");

            entity.Name = title.Trim();
            entity.Description = description;
            entity.Location = location;
            entity.EventDate = startsAt?.ToUniversalTime();
            entity.EndsAt = endsAt?.ToUniversalTime();

            await _unitOfWork.CompleteAsync();
            return await GetByIdAsync(eventId, groupId);
        });

        public async Task<bool> DeleteEventAsync(int eventId, string? version = null, int? groupId = null)
        {
            return await _unitOfWork.ExecuteWorkflowAsync(async () =>
            {
                var entity = await Load(eventId, groupId);
                var member = await Member(entity.GroupId);
                WorkflowPolicy.Edit(member, entity.CreatedById);
                WorkflowPolicy.Version(entity.Version, version);

                var taskCount = await _unitOfWork.Repository<Core.Entities.Task>().CountAsync(t => t.EventId == eventId && !t.IsDeleted);
                if (taskCount > 0)
                {
                    throw new BusinessException(409, "EVENT_HAS_TASKS", "Sự kiện còn công việc không thể xóa. Chuyển công việc sang sự kiện khác hoặc chọn không thuộc sự kiện.");
                }

                Repo.Delete(entity);
                await _unitOfWork.CompleteAsync();
                return true;
            });
        }

        private async Task<List<EventViewDto>> Views(IEnumerable<EventEntity> entities)
        {
            var list = entities.ToList();
            var groups = list.Select(e => e.GroupId).Distinct().ToList();
            var memberMap = new Dictionary<int, List<GroupMember>>();
            foreach (var group in groups)
            {
                memberMap[group] = (await _groupMemberRepository.GetAsync(group)).ToList();
            }

            return list.Select(e =>
            {
                var view = _mapper.Map<EventViewDto>(e);
                view.Title = e.Name;
                view.StartsAt = e.EventDate;
                view.EndsAt = e.EndsAt;
                view.Location = e.Location;
                view.Version = e.Version;
                view.CreatedAt = e.CreatedAt;
                view.UpdatedAt = e.UpdatedAt;

                var tasks = e.Tasks?.Where(t => !t.IsDeleted).ToList() ?? new List<Core.Entities.Task>();
                view.TaskCount = tasks.Count;
                view.CompletedTaskCount = tasks.Count(t => t.Status == TaskStatusEnum.Done);

                var members = memberMap.ContainsKey(e.GroupId) ? memberMap[e.GroupId] : new List<GroupMember>();
                var creator = members.FirstOrDefault(gm => gm.UserId == e.CreatedById);
                if (creator != null)
                {
                    view.CreatedBy = new AssigneeSummaryDto
                    {
                        UserId = creator.UserId,
                        DisplayName = creator.User.FullName,
                        AvatarUrl = creator.User.Avatar
                    };
                }

                var currentUserId = _currentUser.GetUserId();
                var currentMember = members.FirstOrDefault(m => m.UserId == currentUserId);
                var canEdit = currentMember != null && WorkflowPolicy.CanEdit(currentMember, e.CreatedById);
                view.Permissions = new EventPermissionsDto
                {
                    CanEdit = canEdit,
                    CanDelete = canEdit
                };

                return view;
            }).ToList();
        }
    }
}
