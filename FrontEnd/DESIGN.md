# WeShare — Design System & UI Style Reference
> **Deep Moss with Lime Voltage.** Hơi thở thiết kế fintech hiện đại: nền rừng trầm vững chãi (*Forest Ink* `#163300`) kết hợp cùng điểm nhấn tia chớp điện năng lượng (*Lime Voltage* `#9fe870`), mang lại cảm giác minh bạch, dứt khoát và đáng tin cậy cho nền tảng quản lý tài chính nhóm và phân chia công việc WeShare.

---

## 1. Triết lý Thiết kế (Design Ethos)

WeShare xây dựng trải nghiệm chia sẻ hóa đơn và quản trị nhiệm vụ nhóm dựa trên 4 trụ cột thị giác:

1. **Uy lực & Minh bạch (Authority & Transparency):**
   Màu xanh rêu trầm sâu (*Forest Ink* `#163300`) đóng vai trò làm trục thẩm mỹ chính — áp dụng cho thanh điều hướng, typography tiêu đề lớn và các khối thẻ hero tài chính. Nó tạo ra trọng lượng thị giác vững chãi, đáng tin cậy cho một ứng dụng tài chính.
2. **Điểm nhấn Chức năng (Functional Accent):**
   Màu xanh chanh điện quang (*Lime Voltage* `#9fe870`) hoạt động như một dấu câu hành động: chỉ dùng cho nút Primary CTA, tab đang kích hoạt, trạng thái số dư dương hoặc các huy hiệu quan trọng. Không lạm dụng làm màu nền đại trà.
3. **Ngôn ngữ Hình học Pill (Pill Geometry):**
   Mọi nút bấm, tab chuyển đổi, huy hiệu trạng thái (status badge) và thanh điều hướng đều mặc định sử dụng bo góc tròn hoàn toàn (`rounded-full` / `9999px`). Các thẻ nội dung (Card) và khung nhập liệu sử dụng bán kính mềm mại (`rounded-2xl` đến `rounded-3xl` / 16px–28px).
4. **Tương phản Typography Rõ nét (High Contrast Typography):**
   Sử dụng font chữ không chân **Inter** với trọng số từ 400 (Body) đến 800/900 (Headings). Các con số tài chính và số dư luôn được phóng to, in đậm (bold/black) với tracking hẹp để con số luôn trực quan, không gây nhầm lẫn.

---

## 2. Bảng Mã Màu & Design Tokens (Color Palette)

### 2.1. Bảng màu Cốt lõi (Brand Core)

| Tên Token | Hex Code | Tên CSS Variable | Vai trò & Ứng dụng trong WeShare |
|-----------|----------|-------------------|----------------------------------|
| **Forest Ink** | `#163300` | `--color-forest-ink` | Màu thương hiệu chủ đạo. Nền thẻ Hero chi tiêu, chữ tiêu đề chính trên nền sáng, viền nhấn, nền Sidebar active. |
| **Lime Voltage** | `#9fe870` | `--color-lime-voltage` | Điểm nhấn chức năng. Nút "+ Add Expense", active tab, chấm tín hiệu online, số dư dương. |
| **Spruce** | `#054d28` | `--color-spruce` | Xanh ngọc lục bảo thứ cấp. Dùng cho thẻ chi tiết sự kiện, icon thứ cấp và gradient chiều sâu. |
| **Linen Mist** | `#e2f6d5` | `--color-linen-mist` | Lớp phủ xanh nhạt làm nền thẻ nợ, hover state, badge trạng thái hoàn thành. |
| **Fog** | `#e8ebe6` | `--color-fog` | Nền xám xanh nhạt cho thẻ giao dịch (Card surface) và các đường phân cách nhẹ. |
| **Paper** | `#ffffff` | `--color-paper` | Nền canvas trang web ở chế độ Light mode, nền input, chữ trên nền Forest Ink. |
| **Obsidian** | `#0e0f0c` | `--color-obsidian` | Đen ánh xanh sâu. Nền chính trang web ở chế độ Dark mode, tiêu đề tương phản tối đa. |
| **Charcoal** | `#454745` | `--color-charcoal` | Màu chữ nội dung chính (Body text), icon nét mảnh, nhãn phụ. |
| **Pebble** | `#868685` | `--color-pebble` | Màu chữ phụ (Muted text), viền phân tách mỏng, placeholder trong ô tìm kiếm. |
| **Alarm Red** | `#cb272f` | `--color-alarm-red` | Màu cảnh báo nợ ("You Owe"), nút xóa giao dịch, badge công việc quá hạn (Overdue). |
| **Signal Blue** | `#0b4c72` | `--color-signal-blue` | Màu điểm nhấn cho sự kiện nhóm, tag nhóm du lịch (Travel Group). |

---

## 3. Hệ Thống Typography & Phông Chữ

Sử dụng phông chữ **Inter** làm tiêu chuẩn duy nhất, phân tầng rõ rệt qua font-weight và tracking (letter-spacing):

| Cấp bậc | Font Weight | Kích thước | Line Height | Tracking | Ứng dụng thực tế trong WeShare |
|---------|-------------|------------|-------------|----------|--------------------------------|
| **Hero Display** | Black (900) | 36px – 44px | 1.1 | `-0.03em` | Tổng tiền chi tiêu nhóm (`Total Group Spend`), Số dư ròng. |
| **Heading 1** | ExtraBold (800) | 28px – 32px | 1.2 | `-0.02em` | Tên Nhóm (`GroupDetailsPage`), Tiêu đề Event Hub. |
| **Heading 2** | Bold (700) | 20px – 24px | 1.25 | `-0.015em` | Tiêu đề khối "Settlement Status", "Expense History". |
| **Subheading** | SemiBold (600) | 16px – 18px | 1.3 | `-0.01em` | Tên công việc (Task Card), Tên món chi tiêu. |
| **Body Standard** | Medium (500) | 14px – 15px | 1.5 | `normal` | Tên người trả tiền, chi tiết thành viên, số tiền phân bổ. |
| **Caption / Meta** | Regular (400) | 12px – 13px | 1.4 | `+0.01em` | Ngày giờ (`displayDate`), ghi chú giao dịch, hạn chót deadline. |
| **Micro Tag** | SemiBold (600) | 10px – 11px | 1.2 | `+0.02em` | Huy hiệu chiến lược: `EQUALLY`, `PERCENTAGE`, `EXACTLY`. |

---

## 4. Hình Khối, Khoảng Cách & Bo Góc (Spacing & Elevation)

### 4.1. Bo góc (Border Radius Hierarchy)
- **`rounded-full` (9999px):** Bắt buộc cho mọi Button (Primary CTA, Secondary), Segmented Tabs switcher, Badge/Tags, Thanh tìm kiếm Search Pill, Avatar.
- **`rounded-3xl` (24px – 28px):** Dùng cho Thẻ Nhóm (`GroupCard`), Thẻ Hero tài chính (`Total Spend Card`), Modal Dialogs lớn.
- **`rounded-2xl` (16px):** Thẻ giao dịch chi tiêu (`Expense Card`), Thẻ công việc (`Task Card`), Khối cân bằng nợ (`Debt Item`).
- **`rounded-xl` (10px – 12px):** Ô nhập liệu (`Input`, `Select`, `Textarea`), Dropdown Menu item.

### 4.2. Đổ bóng & Nổi khối (Elevation & Surfaces)
- **Surface Level 0 (Canvas):** `#ffffff` (Light) / `#0e0f0c` (Dark).
- **Surface Level 1 (Card/Panel):** `#f8faf7` viền `border-border/70` (Light) / `#131610` viền `dark:border-white/10` (Dark).
- **Surface Level 2 (Highlight/Inverted):** Nền đặc `#163300` với chữ màu `#ffffff` và điểm nhấn `#9fe870`.
- **Shadow Subtle:** `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`.
- **Shadow High (Hero Cards):** `box-shadow: 0 10px 25px -5px rgba(22, 51, 0, 0.25)`.

---

## 5. Đặc Tả Chi Tiết Các Component Cốt Lõi

### 5.1. Global Navigation & Layout

#### Top Navbar (`Header.tsx`)
- Chiều cao cố định 64px (`h-16`), kính mờ hậu cảnh `backdrop-blur-md border-b bg-background/90`.
- **Search Pill:** Thanh tìm kiếm dạng viên thuốc bo tròn 9999px, tích hợp shortcut hiển thị `⌘K / Ctrl+K`.
- **Theme Switcher:** Nút tròn chuyển đổi Light/Dark mode tức thời với icon mặt trời màu vàng lime và mặt trăng rêu sẫm.
- **User Avatar Profile:** Avatar tròn bên phải có menu thả xuống (Dropdown) để vào trang cá nhân hoặc đăng xuất an toàn.
- **Mobile Menu Trigger:** Nút hamburger chỉ hiển thị trên màn hình nhỏ `< 1024px`.

#### Wise Pill Sidebar (`Sidebar.tsx`)
- Chiều rộng 260px trên Desktop, nền canvas sạch sẽ.
- Logo WeShare ở trên cùng với biểu tượng kết nối tài chính xanh chanh.
- Các mục menu (Dashboard, Groups, Transactions, Debts, Profile) thiết kế dạng **Pill dài**:
  + **Trạng thái Active:** Nền xanh rêu sẫm `bg-[#163300] text-[#9fe870]` (hoặc `dark:bg-[#9fe870] dark:text-[#163300]`).
  + **Trạng thái Thường:** Text xám đậm, bo viền mềm mại, hover đổi màu nhẹ.

#### Mobile Bottom Navigation (`BottomNav.tsx`)
- Cố định ở đáy màn hình điện thoại (`fixed bottom-0 left-0 right-0 z-40 lg:hidden`).
- Bố cục 5 vị trí: *Home*, *Groups*, *Nút (+) Quick Add màu Lime ở chính giữa*, *Tasks*, *Profile*.
- Nút trung tâm nhô cao nhẹ, bo tròn viên thuốc nổi bật hỗ trợ mở nhanh modal thêm chi tiêu trong 1 chạm.

---

### 5.2. Module 1: Dashboard & Group/Event Hub

#### Thẻ Nhóm (`GroupCard.tsx`)
- Thiết kế bo góc 24px (`rounded-3xl`), viền tinh xảo, hiệu ứng hover nâng cao.
- Hiển thị nhãn phân loại:
  + `Club`: Huy hiệu Linen Mist viền xanh lá.
  + `Travel`: Huy hiệu xanh da trời nhạt viền xanh biển.
  + `General`: Huy hiệu xám tối giản.
- **Avatar Stack:** Hiển thị tối đa 4 avatar lồng nhau của các thành viên cốt cán + huy hiệu `+N` người còn lại.
- Nút bấm *"Open Hub"* bo tròn pill dẫn trực tiếp vào không gian làm việc của nhóm.

#### Màn hình Chi tiết Sự kiện (`EventDetail.tsx`)
- **Event Timeline:** Khối thời gian hiển thị `startsAt` → `endsAt` có icon lịch và đồng hồ trực quan.
- **Tiến độ Công việc (Progress Bar):** Thanh tiến trình màu Lime Voltage thể hiện số lượng công việc đã hoàn thành trên tổng số task của sự kiện (`completedTaskCount / taskCount`).
- **Internal Tabs:** Chuyển đổi mượt mà giữa:
  + Tab **Tasks**: Các đầu việc được giao trong khuôn khổ sự kiện.
  + Tab **Participants**: Danh sách thành viên tham dự.
  + Tab **Expenses**: Các hóa đơn chi phí đã phát sinh trong sự kiện.

---

### 5.3. Module 2: Quản lý Nhiệm vụ (Task Assignment)

#### Bảng Công việc Kanban (`TaskKanbanBoard.tsx`)
- Cấu trúc 3 cột quy trình trực quan:
  1. **To Do (Cần làm):** Nền xám nhạt `bg-slate-50/70 dark:bg-slate-900/40`.
  2. **In Progress (Đang làm):** Nền hổ phách nhạt `bg-amber-50/50 dark:bg-amber-950/20`.
  3. **Completed (Đã xong):** Nền xanh lá dịu `bg-emerald-50/50 dark:bg-emerald-950/20`.
- **Thẻ Task (Task Card):**
  - Tiêu đề công việc in đậm, hỗ trợ click xem modal chi tiết [`TaskDetail.tsx`](file:///d:/WeShare/WeShare/FrontEnd/src/pages/group/components/work/TaskDetail.tsx).
  - Avatar stack nhỏ của những người được phân công (Assignees).
  - **Deadline Tag:**
    + **Quá hạn (Overdue):** Huy hiệu màu đỏ Alarm Red nhấp nháy cảnh báo.
    + **Sắp tới hạn (Due Soon - trong 24h):** Huy hiệu màu cam/vàng.
    + **Bình thường:** Huy hiệu xám trung tính hiển thị ngày cụ thể.
  - **Liên kết Hóa đơn (Expense Tag):** Hiển thị số lượng giao dịch chi phí gắn với task (`task.expenseCount`).
  - **Quick Status Changer:** Nút đổi trạng thái nhanh trực tiếp trên góc thẻ không cần mở form sửa.

---

### 5.4. Module 3: Quản lý Chi tiêu & Chia tiền (Expense Tracker & Splitter) [TRỌNG TÂM]

#### Bảng điều khiển phân bổ chi phí (`ExpenseSplitterDashboard.tsx`)
Gồm 3 phân khu hiển thị logic tài chính hoàn chỉnh:

1. **Khối Hero Thống kê Tài chính (Financial Snapshot):**
   - **Thẻ 1 (Total Group Spend):** Nền Forest Ink `#163300`, chữ trắng đậm, con số tiền tổng kích thước lớn (`text-4xl font-black`), hiển thị tổng chi tiêu của cả nhóm.
   - **Thẻ 2 (Your Net Balance):** Tự động tính chênh lệch công nợ của người dùng hiện tại:
     + Nếu người khác nợ mình: Hiển thị dòng *"You Receive"* màu xanh tươi sáng.
     + Nếu mình nợ người khác: Hiển thị dòng *"You Owe"* màu đỏ nổi bật.
     + Nếu đã cân bằng: Hiển thị *"All Balanced"*.
   - **Thẻ 3 (Outstanding Overview):** Thanh tỷ lệ tương quan giữa tổng nợ phải trả và tổng nợ phải thu.

2. **Khối Trực quan hóa Số dư (Settlement Status - "Ai nợ ai bao nhiêu tiền"):**
   - Cột trái: **You Owe (Bạn nợ ai):** Liệt kê chủ nợ, số tiền, và nút bấm **"Settle"** để kích hoạt modal chuyển khoản thanh toán ngay.
   - Cột phải: **Owed to You (Ai nợ bạn):** Liệt kê người nợ, số tiền, và nút bấm **"Remind"** gửi thông báo nhắc nợ.

3. **Sổ cái Chi tiêu & Phân bổ (Expense Ledger & Splits):**
   - Bộ lọc tìm kiếm nhanh theo tên món/người trả và dropdown lọc theo chế độ chia tiền (`EQUALLY`, `PERCENTAGE`, `EXACTLY`).
   - Mỗi thẻ hóa đơn hiển thị rõ: Tên món, Avatar & tên người thanh toán (Payer), tổng số tiền, huy hiệu Task liên kết.
   - **Splits Strip:** Dải thẻ nhỏ phía dưới liệt kê danh sách từng người cùng phần tiền chịu trách nhiệm trong hóa đơn đó.

#### Modal Thêm Chi tiêu Mới (`AddExpenseModal.tsx`)
- Nhập số tiền lớn phong cách chuyển tiền fintech (Hero input số tiền lớn, font chữ to ở giữa).
- Nhập nội dung chi tiêu (món gì, bữa ăn nào).
- **Lựa chọn 3 Chế độ chia tiền:**
  1. `EQUALLY`: Chia đều số tiền cho các thành viên được tích chọn.
  2. `PERCENTAGE`: Nhập phần trăm cụ thể cho từng thành viên (tự động kiểm tra tổng phải đạt 100%).
  3. `EXACTLY`: Nhập số tiền chính xác cho từng người (tự động so khớp với tổng số tiền hóa đơn).
- **Liên kết Công việc (`TaskPicker`):** Chọn nhanh công việc liên quan để quy trách nhiệm chi phí.
- **Tải ảnh biên lai (Receipt upload):** Xem trước ảnh hóa đơn trực quan.

#### Modal Thanh toán Nhanh (`QuickSettleUpModal.tsx`)
- **Tự động sinh mã VietQR Napas247:**
  - Lấy `bankName` và `defaultBankAccount` của chủ nợ từ cơ sở dữ liệu.
  - Tự động sinh đường dẫn ảnh QR: `https://img.vietqr.io/image/<bank>-<acc>-compact2.png?amount=<amount>&addInfo=<memo>`.
  - Hỗ trợ nút Copy 1-click Số tài khoản và Số tiền.
- **Thanh toán Tiền mặt (Cash Settlement):** Hỗ trợ xác nhận giao dịch trả tiền mặt trực tiếp.
- **Tải lên biên lai chuyển khoản:** Cho phép đính kèm ảnh ủy nhiệm chi ngân hàng gửi lên backend qua `transactionApi.uploadProof`.

---

## 6. Hướng Dẫn Kỹ Thuật Cho Lập Trình Viên (Developer Rules)

### 6.1. Quy tắc NÊN LÀM (Do's)
- Luôn sử dụng `rounded-full` cho mọi nút bấm và tab điều khiển.
- Đặt font-weight `800` hoặc `900` cho các con số tiền tệ lớn để tạo phong thái tài chính dứt khoát.
- Chỉ dùng màu `#9fe870` (Lime Voltage) cho các thành phần kêu gọi hành động (Call To Action) chính yếu.
- Đảm bảo toàn bộ form nhập liệu có tích hợp responsive classes: `flex-col sm:flex-row`, `grid-cols-1 md:grid-cols-2`.
- Kiểm tra trạng thái Dark Mode trên mọi thẻ giao diện bằng tiền tố `dark:bg-slate-900`, `dark:text-white`.

### 6.2. Quy tắc KHÔNG NÊN LÀM (Don'ts)
- **Không** sử dụng góc vuông nhọn (`rounded-none` hoặc `rounded-xs`) cho các nút bấm — hình khối viên thuốc (Pill) là DNA nhận diện của thương hiệu.
- **Không** dùng màu xanh chanh (`#9fe870`) làm màu chữ trên nền trắng vì độ tương phản không đạt chuẩn WCAG. Chỉ dùng màu này làm nền nút bấm hoặc chữ trên nền đen/rêu trầm `#163300`.
- **Không** sử dụng drop shadow quá đậm hoặc màu mè; ưu tiên đường viền mỏng tinh tế (`border border-border/80`).
- **Không** hardcode màu sắc; luôn ưu tiên sử dụng CSS variables hoặc Tailwind theme tokens.

---

## 7. Khai Báo Biến CSS Toàn Cục (Tailwind / Root Variables)

```css
:root {
  /* WeShare Brand Core */
  --color-forest-ink: #163300;
  --color-lime-voltage: #9fe870;
  --color-spruce: #054d28;
  --color-linen-mist: #e2f6d5;
  --color-fog: #e8ebe6;
  --color-paper: #ffffff;
  --color-obsidian: #0e0f0c;
  --color-charcoal: #454745;
  --color-pebble: #868685;
  --color-alarm-red: #cb272f;
  --color-signal-blue: #0b4c72;

  /* Radius Tokens */
  --radius-pill: 9999px;
  --radius-card: 24px;
  --radius-modal: 28px;
  --radius-input: 12px;
}

.dark {
  --color-paper: #0e0f0c;
  --color-fog: #161a14;
  --color-forest-ink: #9fe870;
  --color-charcoal: #e8ebe6;
  --color-pebble: #a1a3a0;
}
```
