---
name: ai-dev-team
description: >-
  Orchestrates the multi-agent AI development workflow for the WeShare repository.
  Use this skill whenever the user assigns a feature development, bug fix, or refactoring
  task on WeShare involving Backend (.NET 8 C#), Frontend (React/TS), or both.
---

# WeShare AI Dev Team Workflow

Quy trình tự động hóa phát triển phần mềm chuẩn mực dành riêng cho dự án **WeShare**, phối hợp các vai trò Architect, Backend Engineer, Frontend Engineer và QA trực tiếp trên mã nguồn.

---

## BƯỚC 1: KHẢO SÁT & CHỐT THIẾT KẾ (ARCHITECT PHASE)

1. **Tạo nhánh Git mới:**
   Tạo nhánh tính năng tách biệt trước khi chỉnh sửa bất kỳ file nào:
   `git checkout -b feat/<ten-tinh-nang>`

2. **Khảo sát mã nguồn thực tế (Bắt buộc):**
   - Đọc các Controller hiện có: `BackEnd/WeShare.API/Controllers/`
   - Đọc các Entity và DTOs: `BackEnd/WeShare.Core/Entities/`, `BackEnd/WeShare.Application/Dtos/`
   - Đọc các Component và Pages liên quan: `FrontEnd/src/pages/`, `FrontEnd/src/api/`
   *Tuyệt đối không phỏng đoán nếu chưa đọc code thật.*

3. **Lập bản đặc tả ngắn gọn (API Contract & Tasks):**
   - Nêu rõ endpoint, method HTTP, Request/Response DTO.
   - Nêu rõ component UI cần thêm/sửa (ví dụ: Tab mới trong `GroupDetailsPage.tsx`).

---

## BƯỚC 2: TRIỂN KHAI MÃ NGUỒN (DEVELOPMENT PHASE)

### Phía Backend (.NET 8):
1. Cập nhật hoặc tạo Entity / Enum trong `WeShare.Core` nếu có thay đổi database.
2. Tạo DTOs trong `WeShare.Application/Dtos/`.
3. Định nghĩa Interface trong `WeShare.Application/Interfaces/` và triển khai trong `Services/`.
4. Viết Endpoint trong Controller tương ứng (`WeShare.API/Controllers/`).
5. Đăng ký Dependency Injection nếu có service mới.

### Phía Frontend (React + Vite + TypeScript):
1. Định nghĩa kiểu dữ liệu trong `FrontEnd/src/types/`.
2. Viết hàm gọi API trong `FrontEnd/src/api/` dùng `axiosInstance`.
3. Dựng component hoặc tab mới trong `FrontEnd/src/pages/`, sử dụng Shadcn UI và Tailwind CSS.
4. Gắn component mới vào Layout hoặc Tabs tương ứng.

---

## BƯỚC 3: KIỂM CHỨNG & XÁC THỰC LỖI (QA & VERIFICATION)

Chạy trực tiếp các lệnh kiểm tra trong terminal để bắt lỗi biên dịch:

1. **Kiểm tra Backend:**
   ```powershell
   dotnet build BackEnd/WeShare.sln
   ```
   Nếu có lỗi biên dịch (CSxxxx), đọc mã lỗi và sửa ngay lập tức.

2. **Kiểm tra Frontend:**
   ```powershell
   npm --prefix FrontEnd run build
   ```
   Nếu có lỗi TypeScript hoặc import gãy, sửa ngay trước khi báo cáo.

---

## BƯỚC 4: NGHIỆM THU & BÁO CÁO CHO USER

1. Chạy `git status` và `git diff` để kiểm tra các file đã thay đổi.
2. Trình bày ngắn gọn cho User:
   - Các file Backend đã thêm/sửa.
   - Các file Frontend đã thêm/sửa.
   - Trạng thái biên dịch (`dotnet build`: PASSED, `npm run build`: PASSED).
3. Hướng dẫn User cách kiểm tra giao diện và API trên trình duyệt.
