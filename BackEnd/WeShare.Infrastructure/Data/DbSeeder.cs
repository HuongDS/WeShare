using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using Task = System.Threading.Tasks.Task;
using TaskEntity = WeShare.Core.Entities.Task;

namespace WeShare.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAllAsync(WeShareDbContext context)
        {
            // Disable soft delete filters or clean all tables safely in correct dependency order
            await context.Database.ExecuteSqlRawAsync(@"
                TRUNCATE TABLE 
                    ""TravelBudgetItems"",
                    ""TravelPlaces"",
                    ""TravelHotels"",
                    ""TravelPlans"",
                    ""Notifications"",
                    ""TaskMembers"",
                    ""Tasks"",
                    ""Events"",
                    ""TransactionSplits"",
                    ""Transactions"",
                    ""GroupDebts"",
                    ""GroupMembers"",
                    ""Groups"",
                    ""RefreshTokens"",
                    ""Users""
                RESTART IDENTITY CASCADE;
            ");

            var now = DateTime.UtcNow;
            string defaultHashedPassword = BCrypt.Net.BCrypt.HashPassword("Password123!");

            // 1. SEED USERS
            var u1 = new User
            {
                FullName = "Song Hương",
                Email = "huong01@gmail.com",
                PasswordHashed = defaultHashedPassword,
                Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                BankName = "Vietcombank",
                BankBin = "970436",
                DefaultBankAccount = "1012345678",
                CreatedAt = now
            };

            var u2 = new User
            {
                FullName = "Đặng Song Hương",
                Email = "dangsonghuong010405@gmail.com",
                PasswordHashed = defaultHashedPassword,
                Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
                BankName = "Techcombank",
                BankBin = "970407",
                DefaultBankAccount = "1903456789",
                CreatedAt = now
            };

            var u3 = new User
            {
                FullName = "Nguyễn Văn An",
                Email = "an@gmail.com",
                PasswordHashed = defaultHashedPassword,
                Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
                BankName = "MBBank",
                BankBin = "970422",
                DefaultBankAccount = "0888999888",
                CreatedAt = now
            };

            var u4 = new User
            {
                FullName = "Trần Thị Bình",
                Email = "binh@gmail.com",
                PasswordHashed = defaultHashedPassword,
                Avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
                BankName = "TPBank",
                BankBin = "970423",
                DefaultBankAccount = "0345678901",
                CreatedAt = now
            };

            var u5 = new User
            {
                FullName = "Lê Văn Chi",
                Email = "chi@gmail.com",
                PasswordHashed = defaultHashedPassword,
                Avatar = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
                BankName = "ACB",
                BankBin = "970416",
                DefaultBankAccount = "2468135790",
                CreatedAt = now
            };

            var u6 = new User
            {
                FullName = "Phạm Tiến Dũng",
                Email = "dung@gmail.com",
                PasswordHashed = defaultHashedPassword,
                Avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
                BankName = "VPBank",
                BankBin = "970432",
                DefaultBankAccount = "1593578888",
                CreatedAt = now
            };

            await context.Users.AddRangeAsync(u1, u2, u3, u4, u5, u6);
            await context.SaveChangesAsync();

            // 2. SEED GROUPS
            var g1 = new Group
            {
                Name = "Chuyến Đi Đà Nẵng - Hội An 🌴",
                Type = GroupTypeEnum.Travel,
                Description = "Lịch trình 4N3Đ khám phá Bà Nà Hills, Phố cổ Hội An và ẩm thực biển miền Trung.",
                InviteCode = "WS-DANANG26",
                CreatedAt = now
            };

            var g2 = new Group
            {
                Name = "Phòng Trọ 302 KTX Xanh 🏠",
                Type = GroupTypeEnum.Club,
                Description = "Quản lý tiền phòng trọ, điện nước, internet và đồ gia dụng dùng chung hàng tháng.",
                InviteCode = "WS-TRO302",
                CreatedAt = now
            };

            var g3 = new Group
            {
                Name = "CLB Cầu Lông WeShare 🏸",
                Type = GroupTypeEnum.Club,
                Description = "Giao lưu rèn luyện sức khỏe, chia tiền thuê sân và cầu thi đấu thứ 3, 5, 7.",
                InviteCode = "WS-BADMINTON",
                CreatedAt = now
            };

            await context.Groups.AddRangeAsync(g1, g2, g3);
            await context.SaveChangesAsync();

            // 3. SEED GROUP MEMBERS
            // Group 1: 5 members
            var gm1_1 = new GroupMember { GroupId = g1.Id, UserId = u1.Id, Role = GroupRoleEnum.Leader, Balance = 2150000m, JoinedAt = now };
            var gm1_3 = new GroupMember { GroupId = g1.Id, UserId = u3.Id, Role = GroupRoleEnum.Member, Balance = 700000m, JoinedAt = now };
            var gm1_4 = new GroupMember { GroupId = g1.Id, UserId = u4.Id, Role = GroupRoleEnum.Member, Balance = -850000m, JoinedAt = now };
            var gm1_5 = new GroupMember { GroupId = g1.Id, UserId = u5.Id, Role = GroupRoleEnum.Member, Balance = -1000000m, JoinedAt = now };
            var gm1_6 = new GroupMember { GroupId = g1.Id, UserId = u6.Id, Role = GroupRoleEnum.Member, Balance = -1000000m, JoinedAt = now };

            // Group 2: 3 members
            var gm2_1 = new GroupMember { GroupId = g2.Id, UserId = u1.Id, Role = GroupRoleEnum.Leader, Balance = 600000m, JoinedAt = now };
            var gm2_3 = new GroupMember { GroupId = g2.Id, UserId = u3.Id, Role = GroupRoleEnum.Member, Balance = -300000m, JoinedAt = now };
            var gm2_4 = new GroupMember { GroupId = g2.Id, UserId = u4.Id, Role = GroupRoleEnum.Member, Balance = -300000m, JoinedAt = now };

            // Group 3: 4 members
            var gm3_1 = new GroupMember { GroupId = g3.Id, UserId = u1.Id, Role = GroupRoleEnum.Leader, Balance = 0m, JoinedAt = now };
            var gm3_2 = new GroupMember { GroupId = g3.Id, UserId = u2.Id, Role = GroupRoleEnum.Member, Balance = 0m, JoinedAt = now };
            var gm3_5 = new GroupMember { GroupId = g3.Id, UserId = u5.Id, Role = GroupRoleEnum.Member, Balance = 0m, JoinedAt = now };
            var gm3_6 = new GroupMember { GroupId = g3.Id, UserId = u6.Id, Role = GroupRoleEnum.Member, Balance = 0m, JoinedAt = now };

            await context.GroupMembers.AddRangeAsync(
                gm1_1, gm1_3, gm1_4, gm1_5, gm1_6,
                gm2_1, gm2_3, gm2_4,
                gm3_1, gm3_2, gm3_5, gm3_6
            );
            await context.SaveChangesAsync();

            // 4. SEED EVENTS
            var ev1 = new Event
            {
                GroupId = g1.Id,
                Name = "Tập trung tại Sân bay Tân Sơn Nhất",
                Description = "Có mặt tại Ga Quốc nội T1 trước 2 tiếng để làm thủ tục ký gửi hành lý.",
                EventDate = now.AddDays(15),
                Location = "Ga Quốc Nội T1, Tân Sơn Nhất, TP.HCM",
                Version = Guid.NewGuid(),
                CreatedAt = now
            };

            var ev2 = new Event
            {
                GroupId = g1.Id,
                Name = "Gala Dinner Hải sản đêm Phố Cổ Hội An",
                Description = "Tiệc tối hải sản ven sông Hoài, sau đó đi dạo chợ đêm ngắm đèn lồng.",
                EventDate = now.AddDays(17),
                Location = "Nhà hàng Bến Trăng Hội An, Quảng Nam",
                Version = Guid.NewGuid(),
                CreatedAt = now
            };

            var ev3 = new Event
            {
                GroupId = g2.Id,
                Name = "Tổng kết tiền nhà & Dọn dẹp phòng cuối tháng",
                Description = "Kiểm tra số điện nước và dọn vệ sinh khu vực bếp, ban công.",
                EventDate = now.AddDays(5),
                Location = "Phòng 302 KTX Xanh",
                Version = Guid.NewGuid(),
                CreatedAt = now
            };

            var ev4 = new Event
            {
                GroupId = g3.Id,
                Name = "Giải cầu lông Đôi Nam Nữ WeShare Cup",
                Description = "Thi đấu giao hữu vòng tròn tính điểm, có phần thưởng nước ngọt cho đội vô địch.",
                EventDate = now.AddDays(3),
                Location = "Sân cầu lông Kỳ Hòa, Quận 10",
                Version = Guid.NewGuid(),
                CreatedAt = now
            };

            await context.Events.AddRangeAsync(ev1, ev2, ev3, ev4);
            await context.SaveChangesAsync();

            // 5. SEED TASKS & TASK MEMBERS
            var t1 = new TaskEntity
            {
                GroupId = g1.Id,
                EventId = ev1.Id,
                Title = "Đặt vé máy bay khứ hồi Vietjet cho cả nhóm",
                Description = "Đặt chuyến bay sáng đi Đà Nẵng, chiều về TP.HCM, bao gồm 20kg hành lý ký gửi.",
                DueAt = now.AddDays(-2),
                Status = TaskStatusEnum.Done,
                CreatedById = u1.Id,
                Version = Guid.NewGuid(),
                CreatedAt = now
            };
            t1.TaskMembers.Add(new TaskMember { GroupId = g1.Id, UserId = u1.Id, Status = TaskStatusEnum.Done });
            t1.TaskMembers.Add(new TaskMember { GroupId = g1.Id, UserId = u3.Id, Status = TaskStatusEnum.Done });

            var t2 = new TaskEntity
            {
                GroupId = g1.Id,
                EventId = ev1.Id,
                Title = "Thuê 2 xe máy tay ga nhận tại Đà Nẵng",
                Description = "Liên hệ dịch vụ thuê xe giao tận sân bay Đà Nẵng lúc hạ cánh.",
                DueAt = now.AddDays(10),
                Status = TaskStatusEnum.InProgress,
                CreatedById = u1.Id,
                Version = Guid.NewGuid(),
                CreatedAt = now
            };
            t2.TaskMembers.Add(new TaskMember { GroupId = g1.Id, UserId = u5.Id, Status = TaskStatusEnum.InProgress });

            var t3 = new TaskEntity
            {
                GroupId = g1.Id,
                EventId = ev2.Id,
                Title = "Đặt bàn tiệc hải sản & bánh kem",
                Description = "Đặt bàn view sát sông Hoài cho 5 người tối thứ 7.",
                DueAt = now.AddDays(16),
                Status = TaskStatusEnum.Created,
                CreatedById = u1.Id,
                Version = Guid.NewGuid(),
                CreatedAt = now
            };
            t3.TaskMembers.Add(new TaskMember { GroupId = g1.Id, UserId = u4.Id, Status = TaskStatusEnum.Created });

            var t4 = new TaskEntity
            {
                GroupId = g1.Id,
                Title = "Mua bảo hiểm du lịch nhóm Bảo Việt",
                Description = "Gói bảo hiểm tai nạn và trễ chuyến bay 4 ngày.",
                DueAt = now.AddDays(-5),
                Status = TaskStatusEnum.Done,
                CreatedById = u1.Id,
                Version = Guid.NewGuid(),
                CreatedAt = now
            };
            t4.TaskMembers.Add(new TaskMember { GroupId = g1.Id, UserId = u6.Id, Status = TaskStatusEnum.Done });

            var t5 = new TaskEntity
            {
                GroupId = g2.Id,
                EventId = ev3.Id,
                Title = "Thanh toán hóa đơn điện nước & Internet tháng này",
                Description = "Chuyển khoản theo số tài khoản chủ nhà gửi trên nhóm Zalo.",
                DueAt = now.AddDays(4),
                Status = TaskStatusEnum.InProgress,
                CreatedById = u1.Id,
                Version = Guid.NewGuid(),
                CreatedAt = now
            };
            t5.TaskMembers.Add(new TaskMember { GroupId = g2.Id, UserId = u3.Id, Status = TaskStatusEnum.InProgress });

            await context.Tasks.AddRangeAsync(t1, t2, t3, t4, t5);
            await context.SaveChangesAsync();

            // 6. SEED TRANSACTIONS & SPLITS
            // Expense 1 in G1 (Vé máy bay)
            var tx1 = new Transaction
            {
                GroupId = g1.Id,
                PayerId = u1.Id,
                TaskId = t1.Id,
                Amount = 6000000m,
                Description = "Vé máy bay khứ hồi Sài Gòn - Đà Nẵng (5 người)",
                Type = TransactionTypeEnum.EXPENSE,
                SplitStrategy = SplitStrategyEnum.EQUALLY,
                ProofUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
                CreatedAt = now.AddDays(-3)
            };
            tx1.TransactionSplits.Add(new TransactionSplit { DebtorId = u1.Id, OwedAmount = 1200000m });
            tx1.TransactionSplits.Add(new TransactionSplit { DebtorId = u3.Id, OwedAmount = 1200000m });
            tx1.TransactionSplits.Add(new TransactionSplit { DebtorId = u4.Id, OwedAmount = 1200000m });
            tx1.TransactionSplits.Add(new TransactionSplit { DebtorId = u5.Id, OwedAmount = 1200000m });
            tx1.TransactionSplits.Add(new TransactionSplit { DebtorId = u6.Id, OwedAmount = 1200000m });

            // Expense 2 in G1 (Khách sạn)
            var tx2 = new Transaction
            {
                GroupId = g1.Id,
                PayerId = u3.Id,
                Amount = 2500000m,
                Description = "Đặt cọc khách sạn Vanda Hotel Đà Nẵng",
                Type = TransactionTypeEnum.EXPENSE,
                SplitStrategy = SplitStrategyEnum.EQUALLY,
                ProofUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
                CreatedAt = now.AddDays(-2)
            };
            tx2.TransactionSplits.Add(new TransactionSplit { DebtorId = u1.Id, OwedAmount = 500000m });
            tx2.TransactionSplits.Add(new TransactionSplit { DebtorId = u3.Id, OwedAmount = 500000m });
            tx2.TransactionSplits.Add(new TransactionSplit { DebtorId = u4.Id, OwedAmount = 500000m });
            tx2.TransactionSplits.Add(new TransactionSplit { DebtorId = u5.Id, OwedAmount = 500000m });
            tx2.TransactionSplits.Add(new TransactionSplit { DebtorId = u6.Id, OwedAmount = 500000m });

            // Expense 3 in G1 (Ăn trưa)
            var tx3 = new Transaction
            {
                GroupId = g1.Id,
                PayerId = u4.Id,
                Amount = 750000m,
                Description = "Ăn trưa mì Quảng Ếch Bếp Trang",
                Type = TransactionTypeEnum.EXPENSE,
                SplitStrategy = SplitStrategyEnum.EQUALLY,
                ProofUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
                CreatedAt = now.AddDays(-1)
            };
            tx3.TransactionSplits.Add(new TransactionSplit { DebtorId = u1.Id, OwedAmount = 150000m });
            tx3.TransactionSplits.Add(new TransactionSplit { DebtorId = u3.Id, OwedAmount = 150000m });
            tx3.TransactionSplits.Add(new TransactionSplit { DebtorId = u4.Id, OwedAmount = 150000m });
            tx3.TransactionSplits.Add(new TransactionSplit { DebtorId = u5.Id, OwedAmount = 150000m });
            tx3.TransactionSplits.Add(new TransactionSplit { DebtorId = u6.Id, OwedAmount = 150000m });

            // Expense 4 in G1 (Vé Bà Nà Hills)
            var tx4 = new Transaction
            {
                GroupId = g1.Id,
                PayerId = u1.Id,
                Amount = 4500000m,
                Description = "Vé cáp treo Bà Nà Hills trọn gói 5 người",
                Type = TransactionTypeEnum.EXPENSE,
                SplitStrategy = SplitStrategyEnum.EQUALLY,
                ProofUrl = "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&auto=format&fit=crop&q=80",
                CreatedAt = now.AddHours(-10)
            };
            tx4.TransactionSplits.Add(new TransactionSplit { DebtorId = u1.Id, OwedAmount = 900000m });
            tx4.TransactionSplits.Add(new TransactionSplit { DebtorId = u3.Id, OwedAmount = 900000m });
            tx4.TransactionSplits.Add(new TransactionSplit { DebtorId = u4.Id, OwedAmount = 900000m });
            tx4.TransactionSplits.Add(new TransactionSplit { DebtorId = u5.Id, OwedAmount = 900000m });
            tx4.TransactionSplits.Add(new TransactionSplit { DebtorId = u6.Id, OwedAmount = 900000m });

            // Settlement in G1 (Chi trả tạm ứng cho Hương)
            var tx5 = new Transaction
            {
                GroupId = g1.Id,
                PayerId = u5.Id,
                Amount = 1000000m,
                Description = "Lê Văn Chi chuyển khoản thanh toán tạm ứng vé máy bay",
                Type = TransactionTypeEnum.PAYMENT,
                PaymentType = TransactionPaymentTypeEnum.QR_CODE,
                Status = TransactionStatusEnum.DONE,
                SplitStrategy = SplitStrategyEnum.OTHER,
                ProofUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
                CreatedAt = now.AddHours(-5)
            };
            tx5.TransactionSplits.Add(new TransactionSplit { DebtorId = u1.Id, OwedAmount = 1000000m });

            // Expense in G2 (Tiền điện nước)
            var tx6 = new Transaction
            {
                GroupId = g2.Id,
                PayerId = u1.Id,
                Amount = 900000m,
                Description = "Tiền điện & nước sinh hoạt phòng trọ tháng này",
                Type = TransactionTypeEnum.EXPENSE,
                SplitStrategy = SplitStrategyEnum.EQUALLY,
                CreatedAt = now.AddDays(-4)
            };
            tx6.TransactionSplits.Add(new TransactionSplit { DebtorId = u1.Id, OwedAmount = 300000m });
            tx6.TransactionSplits.Add(new TransactionSplit { DebtorId = u3.Id, OwedAmount = 300000m });
            tx6.TransactionSplits.Add(new TransactionSplit { DebtorId = u4.Id, OwedAmount = 300000m });

            await context.Transactions.AddRangeAsync(tx1, tx2, tx3, tx4, tx5, tx6);
            await context.SaveChangesAsync();

            // 7. SEED GROUP DEBTS
            // In Group 1:
            // An: paid 2.5m, owes 1.2m (tx1) + 0.5m (tx2) + 0.15m (tx3) + 0.9m (tx4) = 2.75m. Net = -250k.
            // Simplified pairwise debts:
            var gd1 = new GroupDebt { GroupId = g1.Id, FromUserId = u4.Id, ToUserId = u1.Id, Amount = 650000m, CreatedAt = now };
            var gd2 = new GroupDebt { GroupId = g1.Id, FromUserId = u4.Id, ToUserId = u3.Id, Amount = 200000m, CreatedAt = now };
            var gd3 = new GroupDebt { GroupId = g1.Id, FromUserId = u5.Id, ToUserId = u1.Id, Amount = 1000000m, CreatedAt = now };
            var gd4 = new GroupDebt { GroupId = g1.Id, FromUserId = u6.Id, ToUserId = u1.Id, Amount = 500000m, CreatedAt = now };
            var gd5 = new GroupDebt { GroupId = g1.Id, FromUserId = u6.Id, ToUserId = u3.Id, Amount = 500000m, CreatedAt = now };

            // In Group 2:
            var gd6 = new GroupDebt { GroupId = g2.Id, FromUserId = u3.Id, ToUserId = u1.Id, Amount = 300000m, CreatedAt = now };
            var gd7 = new GroupDebt { GroupId = g2.Id, FromUserId = u4.Id, ToUserId = u1.Id, Amount = 300000m, CreatedAt = now };

            await context.GroupDebts.AddRangeAsync(gd1, gd2, gd3, gd4, gd5, gd6, gd7);
            await context.SaveChangesAsync();

            // 8. SEED TRAVEL PLAN & DETAILS (Group 1)
            var tp = new TravelPlan
            {
                GroupId = g1.Id,
                Destination = "Đà Nẵng - Hội An - Bà Nà Hills",
                StartDate = now.AddDays(15),
                EndDate = now.AddDays(18),
                EstimatedBudget = 25000000m,
                Notes = "Chuyến du lịch 4N3Đ cùng nhóm bạn thân. Khám phá Bà Nà Hills, tắm biển Mỹ Khê và thưởng thức ẩm thực miền Trung.",
                CreatedAt = now
            };
            await context.TravelPlans.AddAsync(tp);
            await context.SaveChangesAsync();

            // Hotels
            var h1 = new TravelHotel
            {
                TravelPlanId = tp.Id,
                Name = "Vanda Hotel Danang",
                Address = "03 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
                CheckInDate = now.AddDays(15),
                CheckOutDate = now.AddDays(17),
                Price = 3200000m,
                PhoneNumber = "02363525969",
                BookingUrl = "https://www.booking.com/hotel/vn/vanda.html",
                Notes = "Khách sạn 4 sao sát Cầu Rồng, bao gồm buffet sáng hàng ngày.",
                CreatedAt = now
            };

            var h2 = new TravelHotel
            {
                TravelPlanId = tp.Id,
                Name = "An Bang Beach Hideaway Homestay",
                Address = "Bãi biển An Bàng, Cẩm An, Hội An, Quảng Nam",
                CheckInDate = now.AddDays(17),
                CheckOutDate = now.AddDays(18),
                Price = 1800000m,
                PhoneNumber = "0905123456",
                BookingUrl = "https://www.airbnb.com/rooms/anbang-hideaway",
                Notes = "Homestay ven biển Hội An, cách phố cổ 4km, tiện đạp xe ngắm lúa.",
                CreatedAt = now
            };

            await context.TravelHotels.AddRangeAsync(h1, h2);

            // Places
            var p1 = new TravelPlace
            {
                TravelPlanId = tp.Id,
                Name = "Bà Nà Hills & Cầu Vàng",
                Address = "Thôn An Sơn, Hòa Ninh, Hòa Vang, Đà Nẵng",
                Category = "Tham quan",
                DayNumber = 1,
                VisitTime = "08:30 - 15:30",
                EstimatedCost = 4500000m,
                Notes = "Đi tuyến cáp treo sớm để ngắm sương sớm trên Cầu Vàng.",
                IsVisited = true,
                CreatedAt = now
            };

            var p2 = new TravelPlace
            {
                TravelPlanId = tp.Id,
                Name = "Bánh xèo nem lụi Bà Dưỡng",
                Address = "Kiệt 280/23 Hoàng Diệu, Bình Hiên, Hải Châu, Đà Nẵng",
                Category = "Ăn uống",
                DayNumber = 1,
                VisitTime = "18:00",
                EstimatedCost = 650000m,
                Notes = "Quán nổi tiếng lâu năm, nước chấm mè gan đậu phộng gia truyền rất ngon.",
                IsVisited = true,
                CreatedAt = now
            };

            var p3 = new TravelPlace
            {
                TravelPlanId = tp.Id,
                Name = "Phố cổ Hội An & Thả hoa đăng sông Hoài",
                Address = "Phường Minh An, TP. Hội An, Quảng Nam",
                Category = "Tham quan",
                DayNumber = 2,
                VisitTime = "16:00 - 21:00",
                EstimatedCost = 500000m,
                Notes = "Thuê thuyền thả hoa đăng và dạo phố chụp ảnh đèn lồng rực rỡ.",
                IsVisited = false,
                CreatedAt = now
            };

            var p4 = new TravelPlace
            {
                TravelPlanId = tp.Id,
                Name = "Cơm gà Bà Buội Hội An",
                Address = "22 Phan Chu Trinh, Minh An, TP. Hội An",
                Category = "Ăn uống",
                DayNumber = 2,
                VisitTime = "12:00",
                EstimatedCost = 450000m,
                Notes = "Cơm gà gia truyền hơn 60 năm, nên gọi thêm gỏi gà xé và canh lòng.",
                IsVisited = false,
                CreatedAt = now
            };

            var p5 = new TravelPlace
            {
                TravelPlanId = tp.Id,
                Name = "Faifo Coffee ngắm hoàng hôn mái ngói",
                Address = "130 Trần Phú, Minh An, TP. Hội An",
                Category = "Cà phê",
                DayNumber = 3,
                VisitTime = "16:30",
                EstimatedCost = 320000m,
                Notes = "Ghé tầng thượng chụp ảnh view mái ngói rêu phong Hội An rất đẹp.",
                IsVisited = false,
                CreatedAt = now
            };

            var p6 = new TravelPlace
            {
                TravelPlanId = tp.Id,
                Name = "Tắm biển & Chèo SUP Bãi biển Mỹ Khê",
                Address = "Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
                Category = "Vui chơi",
                DayNumber = 3,
                VisitTime = "06:00 - 08:00",
                EstimatedCost = 400000m,
                Notes = "Đón bình minh sớm trên bãi biển đẹp nhất hành tinh, thuê ván chèo SUP.",
                IsVisited = false,
                CreatedAt = now
            };

            var p7 = new TravelPlace
            {
                TravelPlanId = tp.Id,
                Name = "Chợ Cồn - Mua đặc sản miền Trung làm quà",
                Address = "Góc đường Hùng Vương - Ông Ích Khiêm, Đà Nẵng",
                Category = "Mua sắm",
                DayNumber = 4,
                VisitTime = "09:30",
                EstimatedCost = 1500000m,
                Notes = "Mua chả bò Đà Nẵng, tré bà Đệ, mực rim me, cá bò khô mang về làm quà.",
                IsVisited = false,
                CreatedAt = now
            };

            await context.TravelPlaces.AddRangeAsync(p1, p2, p3, p4, p5, p6, p7);

            // Budget Items
            var b1 = new TravelBudgetItem
            {
                TravelPlanId = tp.Id,
                Name = "Vé máy bay khứ hồi Sài Gòn - Đà Nẵng (Vietjet)",
                Category = "Di chuyển",
                UnitCost = 1600000m,
                Quantity = 5,
                Notes = "Đã bao gồm 20kg hành lý ký gửi mỗi người.",
                CreatedAt = now
            };

            var b2 = new TravelBudgetItem
            {
                TravelPlanId = tp.Id,
                Name = "Thuê 2 xe máy tay ga (4 ngày)",
                Category = "Thuê xe & Xăng",
                UnitCost = 150000m,
                Quantity = 8,
                Notes = "150k/xe/ngày × 2 xe × 4 ngày = 8 lượt thuê.",
                CreatedAt = now
            };

            var b3 = new TravelBudgetItem
            {
                TravelPlanId = tp.Id,
                Name = "Xăng xe di chuyển Đà Nẵng - Hội An - Bà Nà",
                Category = "Thuê xe & Xăng",
                UnitCost = 100000m,
                Quantity = 4,
                Notes = "Đổ 2 bình xăng cho 2 xe đi cả hành trình.",
                CreatedAt = now
            };

            var b4 = new TravelBudgetItem
            {
                TravelPlanId = tp.Id,
                Name = "Quỹ ăn uống hải sản & ẩm thực chung cả chuyến",
                Category = "Ăn uống chung",
                UnitCost = 80000m,
                Quantity = 5,
                Notes = "Quỹ ăn chung 4 ngày 3 đêm cho 5 thành viên.",
                CreatedAt = now
            };

            var b5 = new TravelBudgetItem
            {
                TravelPlanId = tp.Id,
                Name = "Vé tham quan & Show Ký Ức Hội An",
                Category = "Vé & Tour",
                UnitCost = 500000m,
                Quantity = 5,
                Notes = "Vé show biểu diễn thực cảnh ngoài trời Ký Ức Hội An.",
                CreatedAt = now
            };

            var b6 = new TravelBudgetItem
            {
                TravelPlanId = tp.Id,
                Name = "Quỹ dự phòng sự cố & thời tiết phát sinh",
                Category = "Dự phòng",
                UnitCost = 300000m,
                Quantity = 5,
                Notes = "Dự phòng y tế, thuốc say tàu xe và chi phí phát sinh.",
                CreatedAt = now
            };

            await context.TravelBudgetItems.AddRangeAsync(b1, b2, b3, b4, b5, b6);
            await context.SaveChangesAsync();

            // 9. SEED NOTIFICATIONS
            var noti1 = new Notification
            {
                ReceiveId = u1.Id,
                Title = "Lời nhắc thanh toán nợ",
                Message = "Trần Thị Bình vừa gửi lời nhắc nợ cho bạn trong nhóm Chuyến Đi Đà Nẵng - Hội An.",
                Type = NotificationTypeEnum.REMINDER,
                RelatedGroupId = g1.Id,
                IsRead = false,
                CreatedAt = now.AddHours(-2)
            };

            var noti2 = new Notification
            {
                ReceiveId = u1.Id,
                Title = "Chi tiêu mới đã được tạo",
                Message = "Nguyễn Văn An vừa thêm chi tiêu 'Đặt cọc khách sạn Vanda Hotel Đà Nẵng' (2,500,000 đ).",
                Type = NotificationTypeEnum.PAYMENT,
                RelatedGroupId = g1.Id,
                IsRead = true,
                CreatedAt = now.AddDays(-2)
            };

            var noti3 = new Notification
            {
                ReceiveId = u1.Id,
                Title = "Xác nhận quyết toán nợ",
                Message = "Lê Văn Chi đã chuyển khoản 1,000,000 đ để quyết toán nợ cùng ảnh minh chứng.",
                Type = NotificationTypeEnum.PAYMENT,
                RelatedGroupId = g1.Id,
                IsRead = true,
                CreatedAt = now.AddHours(-5)
            };

            await context.Notifications.AddRangeAsync(noti1, noti2, noti3);
            await context.SaveChangesAsync();
        }
    }
}
