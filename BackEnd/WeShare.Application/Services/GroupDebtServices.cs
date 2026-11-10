using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using WeShare.Application.Dtos.GroupDebt;
using WeShare.Application.Interfaces;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace WeShare.Application.Services
{
    public class GroupDebtServices : IGroupDebtServices
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailServices _emailServices;

        public GroupDebtServices(IUnitOfWork unitOfWork, IMapper mapper, IEmailServices emailServices)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailServices = emailServices;
        }

        public async Task<IEnumerable<GroupDebtViewDto>> GetMyDebtsAsync(int userId, int groupId)
        {
            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var entities = await groupDebtRepo.FindAsync(gd => gd.FromUserId == userId && gd.GroupId == groupId, gd => gd.FromUser, gd => gd.ToUser);
            return _mapper.Map<IEnumerable<GroupDebtViewDto>>(entities);
        }

        public async Task<IEnumerable<GroupDebtViewDto>> GetGroupDebtsThatIOweAsync(int userId, int groupId)
        {
            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var entities = await groupDebtRepo.FindAsync(gd => gd.ToUserId == userId && gd.GroupId == groupId, gd => gd.FromUser, gd => gd.ToUser);
            return _mapper.Map<IEnumerable<GroupDebtViewDto>>(entities);
        }

        public async Task RemindDebtAsync(int debtId, int currentUserId)
        {
            var groupDebtRepo = _unitOfWork.Repository<GroupDebt>();
            var debts = await groupDebtRepo.FindAsync(
                d => d.Id == debtId,
                d => d.FromUser,
                d => d.ToUser,
                d => d.Group);

            var debt = debts.FirstOrDefault();
            if (debt == null)
            {
                throw new BadRequestException("Khoản nợ không tồn tại.");
            }

            if (debt.ToUserId != currentUserId)
            {
                throw new BadRequestException("Bạn không phải người thụ hưởng của khoản nợ này.");
            }

            if (debt.Amount <= 0)
            {
                throw new BadRequestException("Khoản nợ đã được quyết toán xong.");
            }

            var creditorName = debt.ToUser?.FullName ?? "Thành viên nhóm";
            var groupName = debt.Group?.Name ?? "nhóm";
            var amountFormatted = debt.Amount.ToString("N0") + " đ";

            // Create in-app notification
            var noti = new Notification
            {
                ReceiveId = debt.FromUserId,
                Title = "Lời nhắc thanh toán nợ",
                Message = $"{creditorName} vừa gửi lời nhắc bạn thanh toán khoản nợ {amountFormatted} trong nhóm {groupName}.",
                Type = NotificationTypeEnum.REMINDER,
                RelatedGroupId = debt.GroupId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _unitOfWork.Repository<Notification>().AddAsync(noti);
            await _unitOfWork.CompleteAsync();

            // Try sending email if debtor has email
            if (!string.IsNullOrEmpty(debt.FromUser?.Email))
            {
                try
                {
                    var subject = $"[WeShare] Nhắc thanh toán khoản nợ tại nhóm {groupName}";
                    var body = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                            <h2 style='color: #16a34a;'>Nhắc nợ từ WeShare</h2>
                            <p>Xin chào <strong>{debt.FromUser.FullName}</strong>,</p>
                            <p><strong>{creditorName}</strong> đã gửi lời nhắc bạn thanh toán khoản nợ chưa quyết toán:</p>
                            <ul>
                                <li><strong>Nhóm:</strong> {groupName}</li>
                                <li><strong>Số tiền:</strong> {amountFormatted}</li>
                            </ul>
                            <p>Vui lòng mở ứng dụng WeShare để thanh toán hoặc xác nhận quyết toán nhé.</p>
                            <br/>
                            <p>Trân trọng,<br/>Đội ngũ WeShare</p>
                        </div>";
                    await _emailServices.SendEmailAsync(debt.FromUser.Email, subject, body);
                }
                catch
                {
                    // Ignore email transport failure to keep notification reliable
                }
            }
        }
    }
}
