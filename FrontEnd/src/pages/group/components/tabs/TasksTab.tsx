import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTasks } from "@/hooks/task/useTasks"
import { useGetGroupMembers } from "@/hooks/group/useGroup"
import { taskStatusLabels, type TaskStatus } from "@/types/task/Task"
import TaskForm from "../work/TaskForm"
import TaskDetail from "../work/TaskDetail"
import { EventPicker } from "../work/WorkPicker"
import { displayDate, QueryState, selectClass, useWorkNavigation, WorkPagination } from "../work/WorkShared"

export default function TasksTab({ groupId }: { groupId: number }) {
  const { params, update } = useWorkNavigation()
  const [creating, setCreating] = useState(false)
  const page = Math.max(1, Number(params.get("taskPage")) || 1)
  const search = params.get("taskSearch") ?? ""
  const status = params.get("taskStatus") ?? ""
  const eventId = params.get("taskEvent") ?? ""
  const assigneeId = params.get("taskAssignee") ?? ""
  const query = useTasks(groupId, { pageIndex: page, pageSize: 20, search: search.trim(), status: status in taskStatusLabels ? status as TaskStatus : undefined, eventId: eventId || undefined, assigneeId: assigneeId || undefined })
  const { members } = useGetGroupMembers(groupId)
  const filter = (values: Record<string, string | null>) => update({ ...values, taskPage: null }, true)
  return <div className="space-y-4 pt-4">
    <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">Công việc</h2><Button onClick={() => setCreating(true)}>Tạo công việc</Button></div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Input aria-label="Tìm công việc" placeholder="Tìm công việc…" maxLength={200} value={search} onChange={e => filter({ taskSearch: e.target.value })} />
      <select aria-label="Lọc trạng thái" className={selectClass} value={status} onChange={e => filter({ taskStatus: e.target.value })}><option value="">Mọi trạng thái</option>{Object.entries(taskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Lọc người được giao" className={selectClass} value={assigneeId} onChange={e => filter({ taskAssignee: e.target.value })}><option value="">Mọi người được giao</option>{members.data?.data?.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select>
    </div>
    <EventPicker groupId={groupId} value={eventId ? { id: eventId, title: params.get("taskEventTitle") || "Sự kiện đã chọn" } : null} onChange={event => filter({ taskEvent: event?.id ?? null, taskEventTitle: event?.title ?? null })} />
    <QueryState loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {!query.isLoading && !query.error && !query.data?.items.length && <p className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Chưa có công việc phù hợp.</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      {!query.error && query.data?.items.map(task => <article key={task.id} className="space-y-2 rounded-xl border bg-card p-4">
        <button className="text-left font-semibold text-primary hover:underline" onClick={() => update({ taskId: task.id })}>{task.title}</button>
        <p className="text-sm">{taskStatusLabels[task.status]} · {task.expenseCount} chi tiêu</p>
        <p className="text-sm text-muted-foreground">{task.assignees.map(user => user.displayName).join(", ") || "Chưa giao"}</p>
        <p className="text-sm text-muted-foreground">{displayDate(task.dueAt)}</p>
        {task.event && <Button variant="link" className="h-auto p-0" onClick={() => update({ tab: "events", taskId: null, eventId: task.event!.id })}>{task.event.title}</Button>}
      </article>)}
    </div>
    <WorkPagination page={page} totalPages={query.data?.totalPages ?? 0} onChange={next => update({ taskPage: String(next) })} busy={query.isFetching} />
    {creating && <TaskForm groupId={groupId} onClose={() => setCreating(false)} onSaved={taskId => { setCreating(false); update({ taskId }) }} />}
    {params.get("taskId") && <TaskDetail key={params.get("taskId")} groupId={groupId} id={params.get("taskId")!} />}
  </div>
}
