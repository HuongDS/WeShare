import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { taskApi } from "@/api/taskApi"
import { useGetGroupMembers } from "@/hooks/group/useGroup"
import { useInvalidateWork } from "@/hooks/task/useTasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { TaskDetails, TaskInput } from "@/types/task/Task"
import { EventPicker } from "./WorkPicker"
import { FieldErrors, localDate, QueryState, workError } from "./WorkShared"

export default function TaskForm({ groupId, task, initialEvent, onClose, onSaved }: {
  groupId: number; task?: TaskDetails; initialEvent?: { id: string; title: string } | null
  onClose: () => void; onSaved: (id: string) => void
}) {
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [dueAt, setDueAt] = useState(localDate(task?.dueAt))
  const [event, setEvent] = useState(task?.event ?? initialEvent ?? null)
  const [assignees, setAssignees] = useState<string[]>(task?.assignees.map(user => String(user.id)) ?? [])
  const [version, setVersion] = useState(task?.version ?? "")
  const [reloading, setReloading] = useState(false)
  const { members } = useGetGroupMembers(groupId)
  const invalidate = useInvalidateWork()
  const mutation = useMutation({ mutationFn: (body: TaskInput) => task ? taskApi.update(groupId, task.id, version, body) : taskApi.create(groupId, body),
    onSuccess: data => { void invalidate(); onSaved(data.id) },
  })
  const reloadVersion = async () => {
    setReloading(true)
    try { const latest = await taskApi.detail(groupId, task!.id); setVersion(latest.version); mutation.reset() } finally { setReloading(false) }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (mutation.isPending || !title.trim()) return
    mutation.mutate({ title: title.trim(), description: description || null, dueAt: dueAt ? new Date(dueAt).toISOString() : null, eventId: event?.id ?? null, assigneeIds: assignees })
  }
  const conflict = isAxiosError(mutation.error) && mutation.error.response?.status === 412
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose() }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>{task ? "Sửa công việc" : "Tạo công việc"}</DialogTitle><DialogDescription>Liên kết công việc không làm thay đổi cách chia tiền.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1"><span>Tên công việc</span><Input required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label className="block space-y-1"><span>Mô tả</span><textarea className="min-h-24 w-full rounded-md border p-2" maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} /></label>
        <label className="block space-y-1"><span>Hạn hoàn thành (giờ địa phương)</span><Input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} /></label>
        {dueAt && new Date(dueAt) < new Date() && <p className="text-sm text-amber-700">Hạn hoàn thành đã qua. Bạn vẫn có thể lưu.</p>}
        <EventPicker groupId={groupId} value={event} onChange={setEvent} disabled={mutation.isPending} />
        <fieldset className="space-y-2 rounded border p-3"><legend>Người được giao</legend>
          <QueryState loading={members.isLoading} error={members.error} retry={() => void members.refetch()} />
          {members.data?.data?.map(member => <label key={member.id} className="flex items-center gap-2"><input type="checkbox" checked={assignees.includes(String(member.id))} onChange={e => setAssignees(current => e.target.checked ? [...current, String(member.id)] : current.filter(id => id !== String(member.id)))} />{member.fullName}</label>)}
          {!members.isLoading && !members.error && !members.data?.data?.length && <p className="text-sm">Chưa có thành viên.</p>}
        </fieldset>
        {mutation.error && <div role="alert" className="space-y-2 text-sm text-destructive"><p>{workError(mutation.error)}</p><FieldErrors error={mutation.error} />
          {conflict && <Button type="button" variant="outline" disabled={reloading} onClick={() => { void reloadVersion().catch(() => undefined) }}>Tải phiên bản mới, giữ nội dung nhập</Button>}
          {conflict && <p>Sau khi tải, hãy kiểm tra nội dung trước khi lưu đè lên phiên bản mới.</p>}
        </div>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Hủy</Button><Button disabled={mutation.isPending || conflict || reloading || !title.trim() || members.isError}>{mutation.isPending ? "Đang lưu…" : "Lưu"}</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}
