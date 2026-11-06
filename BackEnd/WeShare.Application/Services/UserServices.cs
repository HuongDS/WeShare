using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.Other;
using WeShare.Application.Dtos.User;
using WeShare.Application.Helpers;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services
{
    public class UserServices : IUserServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserServices(IUnitOfWork unitOfWork, IMapper mapper, ICacheServices cacheServices, IEmailServices emailServices)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<UserViewDto> GetUserProfileAsync(int userId)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new BadRequestException(ErrorMessage.USER_PROFILE_NOT_FOUND);
            }
            return _mapper.Map<UserViewDto>(user);
        }

        public async Task<UserViewDto> UpdateUserProfileAsync(int userId, UpdateUserDto data)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new BadRequestException(ErrorMessage.USER_PROFILE_NOT_FOUND);
            }
            user.FullName = data.FullName;
            user.Avatar = data.Avatar;
            userRepo.Update(user);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<UserViewDto>(user);
        }

        public async System.Threading.Tasks.Task UpdatePaymentInfor(int userId, UpdatePaymentDto data)
        {
            if (data.BankName.Length == 0 || data.BankBin.Length == 0 || data.BankAccount.Length == 0)
            {
                throw new BadRequestException(ErrorMessage.SOME_THING_WENT_WRONG);
            }

            var userRepo = _unitOfWork.Repository<User>();
            var user = await userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
            }

            var checkExist = await userRepo.FindAsync(x => x.DefaultBankAccount == data.BankAccount);
            if (checkExist.Any(x => x.Id != userId))
            {
                throw new BadRequestException(ErrorMessage.BANK_ACCOUNT_HAS_BEEN_USED);
            }

            user.BankName = data.BankName;
            user.BankBin = data.BankBin;
            user.DefaultBankAccount = data.BankAccount;

            userRepo.Update(user);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<UserViewDto> UpdateAvatarAsync(int userId, string? url, string? publicId)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
            }
            user.Avatar = url;
            user.AvatarPublicId = publicId;
            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<UserViewDto>(user);
        }

        public async Task<PageResultDto<UserViewDto>> GetUserProfilesAsync(string key, int pageSize, int pageIndex)
        {
            var userRepo = _unitOfWork.Repository<User>();
            var (users, totalItems) = await userRepo.GetPagedAsync(
                x => string.IsNullOrEmpty(key)
                || x.FullName.Contains(key)
                || x.Email.Contains(key), pageIndex, pageSize);
            var res = _mapper.Map<IEnumerable<UserViewDto>>(users);
            return new PageResultDto<UserViewDto>
            {
                Items = res.ToList(),
                TotalItems = totalItems,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int userId)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException(ErrorMessage.USER_NOT_FOUND);
            }

            // 1. Groups user is member of
            var groupRepo = _unitOfWork.Repository<Group>();
            var myGroups = (await groupRepo.FindAsync(g => g.GroupMembers.Any(gm => gm.UserId == userId), g => g.GroupMembers)).ToList();
            var userGroupIds = myGroups.Select(g => g.Id).Distinct().ToList();

            // 2. Debts: Total I owe and Total owed to me
            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var debtsIOwe = await groupDebtRepo.FindAsync(gd => gd.FromUserId == userId && gd.Amount > 0);
            var debtsOwedToMe = await groupDebtRepo.FindAsync(gd => gd.ToUserId == userId && gd.Amount > 0);

            decimal totalOwe = debtsIOwe.Sum(d => d.Amount);
            decimal totalOwedToYou = debtsOwedToMe.Sum(d => d.Amount);
            decimal netBalance = totalOwedToYou - totalOwe;

            // 3. Total Spent: expenses paid by user
            var transactionRepo = _unitOfWork.Repository<Transaction>();
            var myExpenses = await transactionRepo.FindAsync(t => t.PayerId == userId && t.Type == TransactionTypeEnum.EXPENSE);
            decimal totalSpent = myExpenses.Sum(t => t.Amount);

            // 4. Pending Tasks count assigned to user
            var taskRepo = _unitOfWork.Repository<WeShare.Core.Entities.Task>();
            var myTasks = await taskRepo.FindAsync(t => t.TaskMembers.Any(tm => tm.UserId == userId));
            int pendingTasksCount = myTasks.Count(t => t.Status != TaskStatusEnum.Done && t.Status != TaskStatusEnum.Canceled);

            // 5. Recent Activities across user's groups
            var recentActivities = new List<DashboardActivityDto>();
            if (userGroupIds.Count > 0)
            {
                var transactions = await transactionRepo.FindAsync(
                    t => userGroupIds.Contains(t.GroupId),
                    t => t.Group,
                    t => t.Payer
                );

                var sortedTxs = transactions
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(10)
                    .ToList();

                foreach (var t in sortedTxs)
                {
                    bool isPayer = t.PayerId == userId;
                    string payerDisplayName = isPayer ? "You" : (!string.IsNullOrEmpty(t.Payer?.FullName) ? t.Payer.FullName : "Member");
                    string category = t.Type == TransactionTypeEnum.PAYMENT ? "Settlement" : "Expense";

                    string title;
                    string description;

                    if (t.Type == TransactionTypeEnum.PAYMENT)
                    {
                        if (isPayer)
                        {
                            title = $"You settled up {t.Amount:N0} đ";
                            description = $"Payment recorded in {t.Group?.Name ?? "Group"}";
                        }
                        else
                        {
                            title = $"{payerDisplayName} settled up {t.Amount:N0} đ";
                            description = $"Payment in {t.Group?.Name ?? "Group"}";
                        }
                    }
                    else
                    {
                        string itemDesc = !string.IsNullOrWhiteSpace(t.Description) ? $"\"{t.Description}\"" : "an expense";
                        if (isPayer)
                        {
                            title = $"You paid {t.Amount:N0} đ for {itemDesc}";
                            description = $"Shared in {t.Group?.Name ?? "Group"}";
                        }
                        else
                        {
                            title = $"{payerDisplayName} paid {t.Amount:N0} đ for {itemDesc}";
                            description = $"Shared in {t.Group?.Name ?? "Group"}";
                        }
                    }

                    recentActivities.Add(new DashboardActivityDto
                    {
                        Id = t.Id,
                        Title = title,
                        Description = description,
                        Category = category,
                        Amount = t.Amount,
                        GroupName = t.Group?.Name,
                        GroupId = t.GroupId,
                        PayerName = payerDisplayName,
                        PayerAvatar = t.Payer?.Avatar,
                        CreatedAt = t.CreatedAt
                    });
                }
            }

            return new DashboardSummaryDto
            {
                TotalSpent = totalSpent,
                TotalOwe = totalOwe,
                TotalOwedToYou = totalOwedToYou,
                NetBalance = netBalance,
                TotalGroups = userGroupIds.Count,
                PendingTasksCount = pendingTasksCount,
                RecentActivities = recentActivities
            };
        }

        public async Task<GlobalSearchResultDto> GlobalSearchAsync(int userId, string keyword)
        {
            var result = new GlobalSearchResultDto();
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return result;
            }

            keyword = keyword.Trim().ToLower();

            // Find groups user is a member of
            var groupRepo = _unitOfWork.Repository<Group>();
            var myGroups = (await groupRepo.FindAsync(
                g => g.GroupMembers.Any(gm => gm.UserId == userId),
                g => g.GroupMembers
            )).ToList();
            var userGroupIds = myGroups.Select(g => g.Id).Distinct().ToList();

            if (userGroupIds.Count == 0)
            {
                return result;
            }

            var groupNameDict = myGroups.ToDictionary(g => g.Id, g => g.Name);

            // 1. Search Groups
            result.Groups = myGroups
                .Where(g => g.Name.ToLower().Contains(keyword))
                .Select(g => new SearchGroupResultItemDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Type = g.Type.ToString(),
                    MemberCount = g.GroupMembers?.Count ?? 1
                })
                .Take(5)
                .ToList();

            // 2. Search Events
            var eventRepo = _unitOfWork.Repository<Event>();
            var events = await eventRepo.FindAsync(
                e => userGroupIds.Contains(e.GroupId) && e.Name.ToLower().Contains(keyword),
                e => e.Group
            );
            result.Events = events
                .Select(e => new SearchEventResultItemDto
                {
                    Id = e.Id,
                    GroupId = e.GroupId,
                    GroupName = e.Group?.Name ?? (groupNameDict.TryGetValue(e.GroupId, out var gn) ? gn : string.Empty),
                    Name = e.Name,
                    Location = e.Location,
                    EventDate = e.EventDate
                })
                .Take(5)
                .ToList();

            // 3. Search Tasks
            var taskRepo = _unitOfWork.Repository<WeShare.Core.Entities.Task>();
            var tasks = await taskRepo.FindAsync(
                t => userGroupIds.Contains(t.GroupId) && t.Title.ToLower().Contains(keyword)
            );
            result.Tasks = tasks
                .Select(t => new SearchTaskResultItemDto
                {
                    Id = t.Id,
                    GroupId = t.GroupId,
                    GroupName = groupNameDict.TryGetValue(t.GroupId, out var gn) ? gn : string.Empty,
                    Title = t.Title,
                    Status = t.Status.ToString(),
                    DueAt = t.DueAt
                })
                .Take(5)
                .ToList();

            // 4. Search Expenses / Transactions
            var transactionRepo = _unitOfWork.Repository<Transaction>();
            var transactions = await transactionRepo.FindAsync(
                t => userGroupIds.Contains(t.GroupId) && t.Description != null && t.Description.ToLower().Contains(keyword),
                t => t.Group,
                t => t.Payer
            );
            result.Expenses = transactions
                .Select(t => new SearchExpenseResultItemDto
                {
                    Id = t.Id,
                    GroupId = t.GroupId,
                    GroupName = t.Group?.Name ?? (groupNameDict.TryGetValue(t.GroupId, out var gn) ? gn : string.Empty),
                    Description = t.Description ?? string.Empty,
                    Amount = t.Amount,
                    PayerName = t.Payer?.FullName ?? "Member",
                    CreatedAt = t.CreatedAt
                })
                .Take(5)
                .ToList();

            // 5. Search Members in common groups
            var userRepo = _unitOfWork.Repository<User>();
            var allUsersInGroups = await userRepo.FindAsync(
                u => u.Id != userId && u.GroupMembers.Any(gm => userGroupIds.Contains(gm.GroupId)),
                u => u.GroupMembers
            );
            result.Members = allUsersInGroups
                .Where(u => !string.IsNullOrEmpty(u.FullName) && u.FullName.ToLower().Contains(keyword))
                .Select(u => {
                    var commonGroupId = u.GroupMembers.FirstOrDefault(gm => userGroupIds.Contains(gm.GroupId))?.GroupId ?? 0;
                    return new SearchMemberResultItemDto
                    {
                        UserId = u.Id,
                        FullName = u.FullName,
                        Avatar = u.Avatar,
                        GroupId = commonGroupId,
                        GroupName = groupNameDict.TryGetValue(commonGroupId, out var gn) ? gn : string.Empty
                    };
                })
                .Take(5)
                .ToList();

            return result;
        }
    }
}
