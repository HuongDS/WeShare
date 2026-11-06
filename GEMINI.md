# QUY TẮC PHÁT TRIỂN DỰ ÁN WESHARE (AI DEV TEAM RULES)

Dự án **WeShare** là nền tảng quản lý chi tiêu nhóm, chia sẻ hóa đơn (bill-splitting) và quản lý công việc/sự kiện nhóm.

---

## 1. KIẾN TRÚC TỔNG THỂ & TECH STACK

Dự án được tổ chức theo mô hình **Monorepo** gồm 2 phần độc lập:

1. **`BackEnd/`**: Sử dụng **C# .NET 8** theo mô hình **Clean Architecture**:
   - `WeShare.API`: Chứa Controllers (`[Route("api/[controller]")]`), Middlewares, cấu hình `Program.cs`.
   - `WeShare.Application`: Chứa Interfaces (`I...Services`), Services (`...Services`), DTOs, Mapping (`AutoMapper`), Validators.
   - `WeShare.Core`: Chứa Entities (`Task`, `Event`, `Group`, `Transaction`, `User` kế thừa `BaseAuditableEntity`), Enums, Constants, Interfaces Repository.
   - `WeShare.Infrastructure`: Chứa `WeShareDbContext` (EF Core), Migrations, Repositories, Database Extensions.
   - Lệnh kiểm tra build: `dotnet build WeShare.sln`

2. **`FrontEnd/`**: Sử dụng **React 18 + Vite + TypeScript**:
   - UI Framework: **Tailwind CSS** + **Shadcn UI** (`@/components/ui/`).
   - State Management: **Redux Toolkit** (`src/store/`).
   - API Client: **Axios instance** (`src/axios/axiosInstance.ts`) + API modules (`src/api/`).
   - Routing: React Router với `src/components/ProtectedRoute.tsx` và `GuestRoute.tsx`.
   - Pages & Components: Tổ chức theo domain (`src/pages/group/`, `src/pages/transaction/`, `src/pages/auth/`).
   - Lệnh kiểm tra build: `npm run build` hoặc `npm run typecheck`

---

## 2. QUY TRÌNH PHỐI HỢP ĐỘI NGŨ AI (AI ROLES & WORKFLOW)

Khi nhận một task phát triển tính năng từ Tech Lead:

1. **Architect Role (Khảo sát & Thiết kế):**
   - Đọc kỹ Controller, Entity và DTOs hiện có trong `BackEnd/` trước khi thiết kế API mới.
   - Đọc kỹ Component/Tabs hiện có trong `FrontEnd/` (ví dụ: `GroupDetailsPage.tsx`) trước khi thêm UI mới.
   - Thiết lập giao ước API Contract chuẩn xác, bám sát conventions hiện hữu.

2. **Backend Role (Kỹ sư C# .NET):**
   - Tuân thủ Clean Architecture: Controller gọi Service qua Interface ➔ Service xử lý logic và gọi Repository/DbContext ➔ Trả về `ResponseDto<T>`.
   - Tái sử dụng `ResponseDto<T>` và constants trong `WeShare.Core.Constants`.
   - Kiểm tra lỗi biên dịch sau khi sửa bằng terminal: `dotnet build BackEnd/WeShare.sln`.

3. **Frontend Role (Kỹ sư React/TS):**
   - Tái sử dụng components trong `@/components/ui/` (Dialog, Tabs, Button, Card, Table...).
   - Định nghĩa kiểu dữ liệu TypeScript trong `src/types/`.
   - Kết nối API qua Axios instance có gắn Auth token.
   - Kiểm tra lỗi TypeScript sau khi sửa bằng terminal: `npm run build` trong `FrontEnd/`.

4. **QA & Reviewer Role:**
   - Đối chiếu lại giữa Backend và Frontend xem tên trường dữ liệu (naming convention: camelCase vs PascalCase) đã khớp nhau 100% chưa.
   - Kiểm tra `git diff` để đảm bảo không xóa nhầm code cũ.

---

## 3. QUY TẮC QUẢN LÝ NHÁNH GIT (GIT BRANCHING DISCIPLINE - BẮT BUỘC)

**MỖI KHI ĐƯỢC GIAO TASK MỚI, AI DEV TEAM PHẢI THỰC HIỆN BƯỚC NÀY ĐẦU TIÊN TRƯỚC KHI CODE:**

1. **Kiểm tra nhánh hiện tại:** Chạy lệnh `git branch --show-current` để xác định đang đứng ở nhánh nào.
2. **Đánh giá độ phù hợp của nhánh:**
   - Nếu nhánh hiện tại **đã khớp** với phạm vi task (ví dụ: task về Task/Event và đang ở `feat/task-event`) ➔ Tiếp tục làm việc trên nhánh đó.
   - Nếu đã có một nhánh khác trên local hoặc remote **phù hợp hơn** với task ➔ Chuyển sang nhánh đó: `git checkout <branch-name>`.
   - Nếu nhánh hiện tại **không phù hợp** hoặc **chưa có nhánh** cho tính năng được giao ➔ **Bắt buộc tạo nhánh mới** với định dạng chuẩn:
     - `feat/<ten-tinh-nang>`: Cho tính năng mới (ví dụ: `feat/dashboard-summary`, `feat/group-invite`, `feat/debt-remind`).
     - `fix/<ten-loi>`: Cho sửa lỗi/bug (ví dụ: `fix/dark-mode-contrast`, `fix/debt-calculation`).
     - `refactor/<module>`: Cho tái cấu trúc mã nguồn.
   - Nhánh mới phải được rẽ nhánh từ nhánh gốc ổn định (`main` hoặc nhánh tính năng cha liên quan).
3. **Tuyệt đối cấm:**
   - Không commit đè tính năng không liên quan vào nhánh của tính năng khác.
   - Không commit trực tiếp lên `main`.
