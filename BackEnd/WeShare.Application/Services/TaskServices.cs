using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Task;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Interfaces;
using WeShare.Core.Other;

namespace WeShare.Application.Services
{
    public class TaskServices : ITaskServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ITaskMemberRepository _taskMemberRepository;

        public TaskServices(IUnitOfWork unitOfWork, IMapper mapper, ITaskMemberRepository taskMemberRepository)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _taskMemberRepository = taskMemberRepository;
        }

        public async Task<int> AddAsync(int userId, TaskCreateDto data)
        {
            var groupRepo = _unitOfWork.Repository<WeShare.Core.Entities.Group>();
            var group = await groupRepo.GetByIdAsync(data.GroupId);
            if (group == null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            var groupMember = group.GroupMembers?.FirstOrDefault(gm => gm.UserId == userId && gm.Role == GroupRoleEnum.Leader);
            if (groupMember == null)
            {
                throw new Exception(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }
            var taskRepo = _unitOfWork.Repository<WeShare.Core.Entities.Task>();
            var entity = _mapper.Map<WeShare.Core.Entities.Task>(data);
            await taskRepo.AddAsync(entity);
            var assignees = data.AssigneeIds.Select(a => new TaskMember
            {
                TaskId = entity.Id,
                UserId = a,
                GroupId = data.GroupId,
                Status = data.Status,
            });
            await _taskMemberRepository.AddRangeAsync(assignees);
            await _unitOfWork.CompleteAsync();
            return entity.Id;
        }

        public async Task<int> UpdateAsync(int userId, TaskUpdateDto data)
        {
            var groupRepo = _unitOfWork.Repository<WeShare.Core.Entities.Group>();
            var group = await groupRepo.GetByIdAsync(data.GroupId);
            if (group == null)
            {
                throw new Exception(ErrorMessage.GROUP_NOT_FOUND);
            }
            var groupMember = group.GroupMembers?.FirstOrDefault(gm => gm.UserId == userId && gm.Role == GroupRoleEnum.Leader);
            if (groupMember == null)
            {
                throw new Exception(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }
            var taskRepo = _unitOfWork.Repository<WeShare.Core.Entities.Task>();
            var entity = await taskRepo.GetByIdAsync(data.TaskId);
            if (entity == null)
            {
                throw new Exception(ErrorMessage.TASK_NOT_FOUND);
            }
            entity = _mapper.Map(data, entity);
            taskRepo.Update(entity);
            await _unitOfWork.CompleteAsync();
            return entity.Id;
        }

        public async System.Threading.Tasks.Task DeleteAsync(int taskId)
        {
            var taskRepo = _unitOfWork.Repository<WeShare.Core.Entities.Task>();
            await taskRepo.Delete(taskId);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<TaskViewDto> GetByIdAsync(int taskId)
        {
            var taskRepo = _unitOfWork.Repository<WeShare.Core.Entities.Task>();
            var entity = taskRepo.GetByIdAsync(taskId);
            if (entity == null)
            {
                throw new Exception(ErrorMessage.TASK_NOT_FOUND);
            }
            return _mapper.Map<TaskViewDto>(entity);
        }

        public async Task<PageResultDto<TaskViewDto>> GetAsync(int pageSize, int pageIndex, string key, TaskStatusEnum? status)
        {
            var taskRepo = _unitOfWork.Repository<WeShare.Core.Entities.Task>();
            System.Linq.Expressions.Expression<Func<WeShare.Core.Entities.Task, bool>> filter = x =>
            (string.IsNullOrEmpty(key) || x.Title.Contains(key)) && (!status.HasValue || x.Status == status.Value);
            var tasks = await taskRepo.GetPagedAsync(pageSize, pageIndex, filter);
            var result = new PageResultDto<TaskViewDto>
            {
                Items = _mapper.Map<List<TaskViewDto>>(tasks.Items),
                TotalItems = tasks.TotalItems,
                TotalPages = tasks.TotalPages,
                PageIndex = pageIndex,
                PageSize = pageSize,
            };
            return result;
        }
    }
}
