using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using WeShare.Application.Dtos.Report;
using WeShare.Application.Interfaces;
using WeShare.Core.Constants;
using WeShare.Core.Entities;
using WeShare.Core.Enums;
using WeShare.Core.Exceptions;
using WeShare.Core.Interfaces;

namespace WeShare.Application.Services
{
    public class ReportServices : IReportServices
    {
        private const string GeneralCategory = "Chi tiêu chung";
        private const string PdfFontFamily = "Arial";

        private readonly IUnitOfWork _unitOfWork;
        private readonly IGroupMemberRepository _groupMemberRepository;

        static ReportServices()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public ReportServices(IUnitOfWork unitOfWork, IGroupMemberRepository groupMemberRepository)
        {
            _unitOfWork = unitOfWork;
            _groupMemberRepository = groupMemberRepository;
        }

        public async Task<GroupAnalyticsDto> GetGroupAnalyticsAsync(int groupId, int userId)
        {
            var data = await LoadReportDataAsync(groupId, userId);
            return BuildAnalytics(data);
        }

        public async Task<ReportFileDto> ExportGroupReportAsync(int groupId, int userId, string format)
        {
            var data = await LoadReportDataAsync(groupId, userId);
            var analytics = BuildAnalytics(data);
            var safeName = string.Join("_", data.Group.Name.Split(Path.GetInvalidFileNameChars()));
            var stamp = DateTime.Now.ToString("yyyyMMdd");

            return (format ?? string.Empty).Trim().ToLowerInvariant() switch
            {
                "xlsx" or "excel" => new ReportFileDto
                {
                    Content = BuildExcel(data, analytics),
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"WeShare_{safeName}_{stamp}.xlsx"
                },
                "pdf" => new ReportFileDto
                {
                    Content = BuildPdf(data, analytics),
                    ContentType = "application/pdf",
                    FileName = $"WeShare_{safeName}_{stamp}.pdf"
                },
                _ => throw new BadRequestException("Định dạng báo cáo không hợp lệ. Chỉ hỗ trợ 'xlsx' hoặc 'pdf'.")
            };
        }

        // ---------- Data loading ----------

        private sealed record ReportData(
            Core.Entities.Group Group,
            List<GroupMember> Members,
            List<Transaction> Expenses,
            List<GroupDebt> Debts);

        private async Task<ReportData> LoadReportDataAsync(int groupId, int userId)
        {
            var group = await _unitOfWork.Repository<Core.Entities.Group>().GetByIdAsync(groupId)
                ?? throw new BadRequestException(ErrorMessage.GROUP_NOT_FOUND);

            var currentMember = await _groupMemberRepository.CheckUserInGroupAsync(groupId, userId);
            if (currentMember is null)
            {
                throw new BadRequestException(ErrorMessage.YOU_HAVE_NO_RIGHT_TO_DO_THIS_ACTION);
            }

            var members = (await _groupMemberRepository.GetAsync(groupId)).ToList();

            var expenses = (await _unitOfWork.Repository<Transaction>().FindAsync(
                t => t.GroupId == groupId && t.Type == TransactionTypeEnum.EXPENSE,
                t => t.Payer, t => t.Task!, t => t.TransactionSplits)).ToList();

            var debts = (await _unitOfWork.Repository<GroupDebt>().FindAsync(
                d => d.GroupId == groupId && d.Amount > 0,
                d => d.FromUser, d => d.ToUser)).ToList();

            return new ReportData(group, members, expenses, debts);
        }

        // ---------- Analytics ----------

        private static string CategoryOf(Transaction t) =>
            string.IsNullOrWhiteSpace(t.Task?.Title) ? GeneralCategory : t.Task!.Title;

        private static GroupAnalyticsDto BuildAnalytics(ReportData data)
        {
            var byCategory = data.Expenses
                .GroupBy(CategoryOf)
                .Select(g => new CategorySpendingDto
                {
                    Label = g.Key,
                    Amount = g.Sum(t => t.Amount),
                    Count = g.Count()
                })
                .OrderByDescending(c => c.Amount)
                .ToList();

            var paidByUser = data.Expenses.GroupBy(t => t.PayerId).ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));
            var shareByUser = data.Expenses
                .SelectMany(t => t.TransactionSplits)
                .GroupBy(s => s.DebtorId)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.OwedAmount));

            var byMember = data.Members
                .Select(m => new MemberSpendingDto
                {
                    UserId = m.UserId,
                    FullName = m.User?.FullName ?? $"User #{m.UserId}",
                    Paid = paidByUser.GetValueOrDefault(m.UserId),
                    Share = shareByUser.GetValueOrDefault(m.UserId)
                })
                .OrderByDescending(m => m.Paid)
                .ToList();

            return new GroupAnalyticsDto
            {
                TotalSpending = data.Expenses.Sum(t => t.Amount),
                TransactionCount = data.Expenses.Count,
                ByCategory = byCategory,
                ByMember = byMember
            };
        }

        // ---------- Excel ----------

        private static byte[] BuildExcel(ReportData data, GroupAnalyticsDto analytics)
        {
            using var wb = new XLWorkbook();

            var expenseSheet = wb.AddWorksheet("Chi tiêu");
            WriteHeader(expenseSheet, "Ngày", "Mô tả", "Hạng mục", "Người chi", "Số tiền (VND)", "Cách chia");
            var row = 2;
            foreach (var t in data.Expenses.OrderByDescending(x => x.CreatedAt))
            {
                expenseSheet.Cell(row, 1).Value = t.CreatedAt.ToLocalTime();
                expenseSheet.Cell(row, 1).Style.DateFormat.Format = "dd/MM/yyyy HH:mm";
                expenseSheet.Cell(row, 2).Value = t.Description ?? string.Empty;
                expenseSheet.Cell(row, 3).Value = CategoryOf(t);
                expenseSheet.Cell(row, 4).Value = t.Payer?.FullName ?? $"User #{t.PayerId}";
                expenseSheet.Cell(row, 5).Value = t.Amount;
                expenseSheet.Cell(row, 5).Style.NumberFormat.Format = "#,##0";
                expenseSheet.Cell(row, 6).Value = t.SplitStrategy.ToString();
                row++;
            }
            expenseSheet.Cell(row, 4).Value = "Tổng";
            expenseSheet.Cell(row, 4).Style.Font.Bold = true;
            expenseSheet.Cell(row, 5).Value = analytics.TotalSpending;
            expenseSheet.Cell(row, 5).Style.NumberFormat.Format = "#,##0";
            expenseSheet.Cell(row, 5).Style.Font.Bold = true;
            expenseSheet.Columns().AdjustToContents();

            var memberSheet = wb.AddWorksheet("Thành viên");
            WriteHeader(memberSheet, "Thành viên", "Đã chi (VND)", "Phần phải chịu (VND)", "Chênh lệch (VND)");
            row = 2;
            foreach (var m in analytics.ByMember)
            {
                memberSheet.Cell(row, 1).Value = m.FullName;
                memberSheet.Cell(row, 2).Value = m.Paid;
                memberSheet.Cell(row, 3).Value = m.Share;
                memberSheet.Cell(row, 4).Value = m.Paid - m.Share;
                memberSheet.Range(row, 2, row, 4).Style.NumberFormat.Format = "#,##0";
                row++;
            }
            memberSheet.Columns().AdjustToContents();

            var debtSheet = wb.AddWorksheet("Công nợ");
            WriteHeader(debtSheet, "Người nợ", "Người được nợ", "Số tiền (VND)");
            row = 2;
            foreach (var d in data.Debts)
            {
                debtSheet.Cell(row, 1).Value = d.FromUser?.FullName ?? $"User #{d.FromUserId}";
                debtSheet.Cell(row, 2).Value = d.ToUser?.FullName ?? $"User #{d.ToUserId}";
                debtSheet.Cell(row, 3).Value = d.Amount;
                debtSheet.Cell(row, 3).Style.NumberFormat.Format = "#,##0";
                row++;
            }
            debtSheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            wb.SaveAs(stream);
            return stream.ToArray();
        }

        private static void WriteHeader(IXLWorksheet sheet, params string[] headers)
        {
            for (var i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#9FE870");
                cell.Style.Font.FontColor = XLColor.FromHtml("#163300");
            }
            sheet.SheetView.FreezeRows(1);
        }

        // ---------- PDF ----------

        private static string Money(decimal value) => $"{value:N0} ₫";

        private static byte[] BuildPdf(ReportData data, GroupAnalyticsDto analytics)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontFamily(PdfFontFamily).FontSize(10));

                    page.Header().Column(col =>
                    {
                        col.Item().Text($"Báo cáo chi tiêu nhóm: {data.Group.Name}").FontSize(16).Bold();
                        col.Item().Text($"Xuất ngày {DateTime.Now:dd/MM/yyyy HH:mm} · {analytics.TransactionCount} khoản chi · Tổng {Money(analytics.TotalSpending)}")
                            .FontColor(Colors.Grey.Darken1);
                    });

                    page.Content().PaddingVertical(12).Column(col =>
                    {
                        col.Spacing(14);

                        col.Item().Text("Chi tiêu theo hạng mục").Bold().FontSize(12);
                        col.Item().Element(c => SimpleTable(c,
                            new[] { "Hạng mục", "Số khoản", "Số tiền" },
                            analytics.ByCategory.Select(x => new[] { x.Label, x.Count.ToString(), Money(x.Amount) })));

                        col.Item().Text("Chi tiêu theo thành viên").Bold().FontSize(12);
                        col.Item().Element(c => SimpleTable(c,
                            new[] { "Thành viên", "Đã chi", "Phần phải chịu", "Chênh lệch" },
                            analytics.ByMember.Select(x => new[] { x.FullName, Money(x.Paid), Money(x.Share), Money(x.Paid - x.Share) })));

                        col.Item().Text("Công nợ hiện tại").Bold().FontSize(12);
                        col.Item().Element(c => SimpleTable(c,
                            new[] { "Người nợ", "Người được nợ", "Số tiền" },
                            data.Debts.Select(d => new[]
                            {
                                d.FromUser?.FullName ?? $"User #{d.FromUserId}",
                                d.ToUser?.FullName ?? $"User #{d.ToUserId}",
                                Money(d.Amount)
                            })));

                        col.Item().Text("Lịch sử chi tiêu").Bold().FontSize(12);
                        col.Item().Element(c => SimpleTable(c,
                            new[] { "Ngày", "Mô tả", "Người chi", "Số tiền" },
                            data.Expenses.OrderByDescending(t => t.CreatedAt).Select(t => new[]
                            {
                                t.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy"),
                                t.Description ?? string.Empty,
                                t.Payer?.FullName ?? $"User #{t.PayerId}",
                                Money(t.Amount)
                            })));
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Trang ");
                        x.CurrentPageNumber();
                        x.Span(" / ");
                        x.TotalPages();
                    });
                });
            }).GeneratePdf();
        }

        private static void SimpleTable(IContainer container, string[] headers, IEnumerable<string[]> rows)
        {
            var rowList = rows.ToList();
            if (rowList.Count == 0)
            {
                container.Text("Không có dữ liệu.").FontColor(Colors.Grey.Darken1);
                return;
            }

            container.Table(table =>
            {
                table.ColumnsDefinition(cols =>
                {
                    foreach (var _ in headers) cols.RelativeColumn();
                });

                table.Header(header =>
                {
                    foreach (var h in headers)
                    {
                        header.Cell().Background("#9FE870").Padding(4).Text(h).Bold().FontColor("#163300");
                    }
                });

                foreach (var r in rowList)
                {
                    foreach (var cell in r)
                    {
                        table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(cell);
                    }
                }
            });
        }
    }
}
