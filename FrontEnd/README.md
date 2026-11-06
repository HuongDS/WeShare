# WeShare — Frontend Web Application

Giao diện người dùng của nền tảng quản lý tài chính nhóm và phân công nhiệm vụ **WeShare**, xây dựng trên nền tảng **React 18 + Vite + TypeScript + Tailwind CSS + Shadcn UI**.

---

## 1. Tech Stack & Công Nghệ

- **Core:** React 18, TypeScript (Strict Mode), Vite 7
- **Styling:** Tailwind CSS v4, Lucide React
- **UI Components:** Shadcn UI (`@/components/ui/`)
- **State Management:**
  - Redux Toolkit (`src/store/`): Quản lý Authentication và User Session
  - TanStack Query (React Query): Server Cache, tự động đồng bộ và refetch dữ liệu
- **API Client:** Axios Client (`src/axios/axiosInstance.ts`) tích hợp Auth Interceptor & Token Refresh
- **Routing:** React Router v6 với `ProtectedRoute` và `GuestRoute`
- **Design System:** Tuân thủ chuẩn thiết kế tại [`DESIGN.md`](./DESIGN.md) (Wise Aesthetic: Forest Ink `#163300`, Lime Voltage `#9fe870`, Linen Mist `#e2f6d5`, Fog `#e8ebe6`, Pill Geometry)

---

## 2. Cấu Trúc Thư Mục

```text
src/
├── api/             # API modules giao tiếp với Backend .NET 8
├── axios/           # Axios instance cấu hình baseURL và JWT interceptors
├── components/      # Global Layout (Header, Sidebar, BottomNav, MainLayout) & UI atoms
├── constants/       # Enums (SplitStrategy, PaymentType, GroupType)
├── hooks/           # Custom React Query hooks (useTransaction, useGroupDebt, useTasks, useGroup)
├── lib/             # Tiện ích chung (cn, formatCurrency...)
├── pages/           # Pages & Feature Components (group, transaction, auth, user)
├── store/           # Redux store & auth slice
└── types/           # TypeScript DTO interfaces khớp chuẩn Backend
```

---

## 3. Lệnh Thao Tác (Scripts)

| Lệnh | Mục đích |
|------|----------|
| `npm run dev` | Khởi chạy server phát triển local tại `http://localhost:5173` |
| `npm run build` | Kiểm tra lỗi TypeScript (`tsc -b`) và đóng gói bản build production với Vite |
| `npm run preview` | Chạy thử bản build production local |
| `npm run lint` | Chạy ESLint kiểm tra quy chuẩn mã nguồn |

---

## 4. Biến Môi Trường (.env)

Tạo file `.env` ở thư mục gốc của `FrontEnd/`:

```env
VITE_API_URL=https://localhost:7133/api
```

---

## 5. Quy Chuẩn Phát Triển (Guidelines)

1. **Design Tokens:** Tra cứu mã màu, typography, và quy tắc bo góc tròn viên thuốc (`rounded-full`) trong file [`DESIGN.md`](./DESIGN.md).
2. **Strict Typing:** Mọi đối tượng dữ liệu API phải có interface rõ ràng trong `src/types/`.
3. **Responsive & Dark Mode:** Mọi component mới cần có responsive classes (`flex-col md:flex-row`) và Dark mode (`dark:bg-slate-900`, `dark:text-white`).
