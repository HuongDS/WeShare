import { isAxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "react-router-dom"

export const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
export function localDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
export const displayDate = (value: string | null) => value ? new Date(value).toLocaleString() : "Chưa đặt hạn"
export function workError(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 412) return "Dữ liệu đã thay đổi. Nội dung bạn nhập được giữ nguyên. Tải phiên bản mới trước khi thử lại."
    if (status === 403) return "Bạn không có quyền thực hiện thao tác này."
    if (status === 404) return "Tài nguyên không còn khả dụng hoặc bạn không có quyền truy cập."
    if (status === 428) return "Thiếu phiên bản tài nguyên. Vui lòng tải lại dữ liệu."
    return error.response?.data?.message || "Không thể kết nối. Vui lòng thử lại."
  }
  return "Không thể thực hiện thao tác. Vui lòng thử lại."
}
export function FieldErrors({ error }: { error: unknown }) {
  if (!isAxiosError(error)) return null
  const fields = error.response?.data?.error?.fields as Record<string, string[]> | undefined
  return fields ? <ul className="text-sm text-destructive" role="alert">{Object.entries(fields).map(([field, messages]) => <li key={field}>{field}: {messages.join(" ")}</li>)}</ul> : null
}
export function QueryState({ loading, error, retry }: { loading: boolean; error: unknown; retry: () => void }) {
  if (loading) return <p role="status" className="p-4 text-muted-foreground">Đang tải…</p>
  if (error) return <div role="alert" className="space-y-2 p-4"><p className="text-destructive">{workError(error)}</p><Button variant="outline" onClick={retry}>Thử lại</Button></div>
  return null
}
export function WorkPagination({ page, totalPages, onChange, busy = false }: { page: number; totalPages: number; onChange: (page: number) => void; busy?: boolean }) {
  return <nav aria-label="Phân trang" className="flex items-center justify-between gap-3 pt-3">
    <Button variant="outline" disabled={page <= 1 || busy} onClick={() => onChange(page - 1)}>Trước</Button>
    <span className="text-sm">Trang {page} / {Math.max(1, totalPages)}</span>
    <Button variant="outline" disabled={page >= totalPages || busy} onClick={() => onChange(page + 1)}>Sau</Button>
  </nav>
}
export function useWorkNavigation() {
  const [params, setParams] = useSearchParams()
  const update = (values: Record<string, string | null>, replace = false) => setParams(previous => {
    const next = new URLSearchParams(previous)
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    return next
  }, { replace })
  return { params, update }
}
