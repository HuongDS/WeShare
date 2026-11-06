# QUY TẮC PHÁT TRIỂN BACKEND (.NET 8 CLEAN ARCHITECTURE)

Áp dụng cho toàn bộ thư mục `BackEnd/`.

---

## 1. NGUYÊN TẮC CLEAN ARCHITECTURE
- **Không bypass tầng:** Controller KHÔNG ĐƯỢC gọi trực tiếp DbContext. Mọi luồng đi qua:
  `Controller -> I...Service -> Service -> Repository / DbContext -> Database`
- **Dependency Injection:** Khai báo interface và service trong `DependencyInjection.cs` của từng project tương ứng (`WeShare.Application`, `WeShare.Infrastructure`).

## 2. CHUẨN CODE C# & ASP.NET CORE
- **Routing:** Sử dụng attribute `[Route("api/[controller]")]`.
- **Response chuẩn:** Mọi API trả về `ResponseDto<T>` (nằm trong `WeShare.Core.Dtos.Share` hoặc `WeShare.Application.Dtos.Share`):
  ```csharp
  return Ok(new ResponseDto<T> { Status = 200, Message = "Thành công", Data = result });
  ```
- **Xác thực:** Mọi Controller cần bảo vệ phải có attribute `[Authorize]`. Lấy User ID từ token:
  ```csharp
  var userId = User.FindFirst("id")?.Value;
  ```
- **Async/Await:** Mọi thao tác I/O (Database, HTTP, Cache) bắt buộc dùng `async Task<IActionResult>` và `await`.

## 3. KIỂM TRA MÃ NGUỒN
Sau khi tạo hoặc chỉnh sửa bất kỳ file C# nào, luôn chạy lệnh kiểm tra trong terminal:
```powershell
dotnet build BackEnd/WeShare.sln
```
Nếu có lỗi biên dịch (CSxxxx), phải sửa ngay lập tức trước khi chuyển sang bước tiếp theo.
