import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { eventApi } from "@/api/eventApi"
import { useEvent, useInvalidateWork, useTasks } from "@/hooks/task/useTasks"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { taskStatusLabels } from "@/types/task/Task"
import { displayDate, QueryState, useWorkNavigation, workError, WorkPagination } from "./WorkShared"
import TaskForm from "./TaskForm"
import EventForm from "./EventForm"

export default function EventDetail({ groupId, id }: { groupId: number; id: string }) {
  const query = useEvent(groupId, id)
  const event = query.data
  const { update } = useWorkNavigation()
  const [editing, setEditing] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [page, setPage] = useState(1)
  const tasks = useTasks(groupId, { pageIndex: page, pageSize: 10, eventId: id }, !!event)
  const invalidate = useInvalidateWork()
  const mutation = useMutation({ mutationFn: () => eventApi.remove(groupId, id, event!.version), onSuccess: () => { void invalidate(); update({ eventId: null }) } })
  return <>
    <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) update({ eventId: null }) }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{event?.title ?? "Chi tiết sự kiện"}</DialogTitle><DialogDescription>Thông tin sự kiện và các công việc thuộc sự kiện.</DialogDescription></DialogHeader>
        <QueryState loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
        {event && !query.error && <div className="space-y-4">
          <p className="whitespace-pre-wrap break-words">{event.description || "Không có mô tả"}</p>
          <p>{displayDate(event.startsAt)} → {displayDate(event.endsAt)}</p>
          <p>Địa điểm: {event.location || "Chưa đặt"}</p>
          <p>{event.taskCount ? `${event.completedTaskCount}/${event.taskCount} công việc hoàn thành` : "Chưa có công việc"}</p>
          <div className="flex flex-wrap gap-2">
            {event.permissions.canEdit && <Button variant="outline" disabled={mutation.isPending} onClick={() => setEditing(true)}>Sửa</Button>}
            {event.permissions.canDelete && <Button variant="destructive" disabled={mutation.isPending} onClick={() => { if (window.confirm("Xóa sự kiện? Cần chuyển hoặc bỏ liên kết tất cả công việc trước.")) mutation.mutate() }}>Xóa</Button>}
          </div>
          {mutation.error && <div role="alert" className="space-y-2 text-destructive"><p>{workError(mutation.error)}</p><p className="text-sm">Sự kiện còn công việc không thể xóa. Chuyển công việc sang sự kiện khác hoặc chọn “Không thuộc sự kiện”.</p><Button variant="outline" onClick={() => { mutation.reset(); void query.refetch() }}>Tải lại dữ liệu</Button></div>}
          <section className="space-y-3 border-t pt-3"><div className="flex items-center justify-between"><h3 className="font-semibold">Công việc</h3><Button onClick={() => setCreatingTask(true)}>Tạo công việc</Button></div>
            <QueryState loading={tasks.isLoading} error={tasks.error} retry={() => void tasks.refetch()} />
            {!tasks.isLoading && !tasks.error && !tasks.data?.items.length && <p className="text-sm text-muted-foreground">Chưa có công việc.</p>}
            {tasks.data?.items.map(task => <button key={task.id} className="flex w-full justify-between gap-2 rounded border p-3 text-left hover:bg-muted" onClick={() => update({ tab: "tasks", eventId: null, taskId: task.id })}><span>{task.title}</span><span className="text-sm text-muted-foreground">{taskStatusLabels[task.status]}</span></button>)}
            <WorkPagination page={page} totalPages={tasks.data?.totalPages ?? 0} onChange={setPage} busy={tasks.isFetching} />
          </section>
        </div>}
      </DialogContent>
    </Dialog>
    {editing && event && <EventForm groupId={groupId} event={event} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} />}
    {creatingTask && event && <TaskForm groupId={groupId} initialEvent={{ id: event.id, title: event.title }} onClose={() => setCreatingTask(false)} onSaved={taskId => { setCreatingTask(false); update({ tab: "tasks", eventId: null, taskId }) }} />}
  </>
}
