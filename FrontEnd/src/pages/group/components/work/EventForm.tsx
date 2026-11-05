import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { eventApi } from "@/api/eventApi"
import { useInvalidateWork } from "@/hooks/task/useTasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { EventDetails, EventInput } from "@/types/event/Event"
import { FieldErrors, localDate, workError } from "./WorkShared"

export default function EventForm({ groupId, event, onClose, onSaved }: { groupId: number; event?: EventDetails; onClose: () => void; onSaved: (id: string) => void }) {
  const [title, setTitle] = useState(event?.title ?? "")
  const [description, setDescription] = useState(event?.description ?? "")
  const [location, setLocation] = useState(event?.location ?? "")
  const [startsAt, setStartsAt] = useState(localDate(event?.startsAt))
  const [endsAt, setEndsAt] = useState(localDate(event?.endsAt))
  const [version, setVersion] = useState(event?.version ?? "")
  const [reloadError, setReloadError] = useState<unknown>(null)
  const [reloading, setReloading] = useState(false)
  const invalidate = useInvalidateWork()
  const mutation = useMutation({ mutationFn: (body: EventInput) => event ? eventApi.update(groupId, event.id, version, body) : eventApi.create(groupId, body),
    onSuccess: data => { void invalidate(); onSaved(data.id) },
  })
  const validDates = !!startsAt && !!endsAt && new Date(endsAt) > new Date(startsAt)
  const conflict = isAxiosError(mutation.error) && mutation.error.response?.status === 412
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (mutation.isPending || !validDates || !title.trim()) return
    mutation.mutate({ title: title.trim(), description: description || null, location: location || null, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() })
  }
  const reload = async () => {
    setReloadError(null); setReloading(true)
    try { const latest = await eventApi.detail(groupId, event!.id); setVersion(latest.version); mutation.reset() } catch (error) { setReloadError(error) } finally { setReloading(false) }
  }
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose() }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>{event ? "Sửa sự kiện" : "Tạo sự kiện"}</DialogTitle><DialogDescription>Thời gian được nhập và hiển thị theo múi giờ của bạn.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1"><span>Tên sự kiện</span><Input required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label className="block space-y-1"><span>Mô tả</span><textarea className="min-h-24 w-full rounded-md border p-2" maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} /></label>
        <label className="block space-y-1"><span>Địa điểm</span><Input maxLength={500} value={location} onChange={e => setLocation(e.target.value)} /></label>
        <label className="block space-y-1"><span>Bắt đầu</span><Input type="datetime-local" required value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label>
        <label className="block space-y-1"><span>Kết thúc</span><Input type="datetime-local" required value={endsAt} onChange={e => setEndsAt(e.target.value)} /></label>
        {startsAt && endsAt && !validDates && <p role="alert" className="text-sm text-destructive">Kết thúc phải sau thời điểm bắt đầu.</p>}
        {mutation.error && <div role="alert" className="space-y-2 text-sm text-destructive"><p>{workError(mutation.error)}</p><FieldErrors error={mutation.error} />
          {conflict && <><Button type="button" variant="outline" disabled={reloading} onClick={() => void reload()}>Tải phiên bản mới, giữ nội dung nhập</Button><p>Hãy kiểm tra nội dung trước khi lưu đè lên phiên bản mới.</p></>}
        </div>}
        {reloadError != null && <p role="alert" className="text-destructive">{workError(reloadError)}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Hủy</Button><Button disabled={mutation.isPending || conflict || reloading || !validDates || !title.trim()}>{mutation.isPending ? "Đang lưu…" : "Lưu"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}
