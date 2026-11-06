# QUY TẮC PHÁT TRIỂN FRONTEND (REACT + VITE + TYPESCRIPT)

Áp dụng cho toàn bộ thư mục `FrontEnd/`.

---

## 1. NGUYÊN TẮC COMPONENT & UI
- **Tái sử dụng Shadcn UI:** Ưu tiên dùng các component đã có trong `src/components/ui/` (`button.tsx`, `dialog.tsx`, `tabs.tsx`, `table.tsx`, `badge.tsx`...). Không tự ý cài đặt thêm thư viện UI ngoài nếu không thực sự cần thiết.
- **Styling:** Sử dụng **Tailwind CSS**. Tận dụng hàm `cn(...)` từ `src/lib/utils.ts` để gộp class CSS điều kiện.
- **Tổ chức thư mục:**
  - Trang lớn đặt trong `src/pages/<domain>/<Domain>Page.tsx` (ví dụ: `src/pages/group/GroupDetailsPage.tsx`).
  - Các component con / tabs đặt trong `src/pages/<domain>/components/` hoặc `components/tabs/`.

## 2. CHUẨN TYPESCRIPT & GỌI API
- **Strict Typing:** Tuyệt đối hạn chế dùng `any`. Mọi DTO request và response phải có interface định nghĩa trong `src/types/<domain>/`.
- **API Modules:** Lời gọi API viết trong `src/api/<domain>Api.ts` sử dụng `axiosInstance`:
  ```typescript
  import axiosInstance from "@/axios/axiosInstance";
  import { ResponseDto } from "@/types/ResponseDto";
  ```
- **Xử lý lỗi:** Sử dụng helper `HandleAxiosError` từ `src/utils/HandleAxiosError.ts` để hiển thị thông báo lỗi qua `sonner` toast.

## 3. KIỂM TRA MÃ NGUỒN
Sau khi tạo hoặc chỉnh sửa component, luôn chạy lệnh kiểm tra TypeScript và build:
```powershell
npm --prefix FrontEnd run build
```
Đảm bảo không có lỗi type error hay broken import nào trước khi kết thúc task.
