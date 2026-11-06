import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { taskApi } from "@/api/taskApi"
import { transactionApi } from "@/api/transactionApi"
import { useInvalidateWork, useTask } from "@/hooks/task/useTasks"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { taskStatusLabels, type TaskStatus } from "@/types/task/Task"
import { displayDate, QueryState, selectClass, useWorkNavigation, workError, WorkPagination } from "./WorkShared"
import TaskForm from "./TaskForm"
import { formatCurrency } from "@/lib/utils"

export default function TaskDetail({ groupId, id }: { groupId: number; id: string }) {
  const query = useTask(groupId, id)
  const task = query.data
  const { update } = useWorkNavigation()
  const [editing, setEditing] = useState(false)
  const [page, setPage] = useState(1)
  const invalidate = useInvalidateWork()
  const expenses = useQuery({ queryKey: ["taskExpenses", groupId, id, page], queryFn: () => transactionApi.getTransactionsByGroupId(groupId, 10, page, id), enabled: !!task })
  const mutation = useMutation({
    mutationFn: async (action: TaskStatus | "delete") => {
      if (action === "delete") {
        await taskApi.remove(groupId, id, task!.version)
      } else {
        await taskApi.status(groupId, id, task!.version, action)
      }
    },
    onSuccess: (_, action) => { void invalidate(); if (action === "delete") update({ taskId: null }) },
  })
  const close = () => update({ taskId: null })
  return <>
    <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) close() }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{task?.title ?? "Chi tiết công việc"}</DialogTitle><DialogDescription>Thông tin công việc và các chi tiêu liên quan.</DialogDescription></DialogHeader>
        <QueryState loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
        {task && !query.error && <div className="space-y-4">
          <p className="whitespace-pre-wrap break-words">{task.description || "Không có mô tả"}</p>
          <p>Người được giao: {task.assignees.map(user => user.displayName).join(", ") || "Chưa giao"}</p>
          <p>Hạn hoàn thành: {displayDate(task.dueAt)}</p>
          {task.event && <Button variant="link" className="h-auto p-0" onClick={() => update({ tab: "events", taskId: null, eventId: task.event!.id })}>Sự kiện: {task.event.title}</Button>}
          <label className="block space-y-1"><span>Trạng thái</span><select aria-label="Trạng thái công việc" className={selectClass} disabled={!task.permissions.canChangeStatus || mutation.isPending} value={task.status} onChange={e => mutation.mutate(e.target.value as TaskStatus)}>{Object.entries(taskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="flex gap-2">
            {task.permissions.canEdit && <Button variant="outline" disabled={mutation.isPending} onClick={() => setEditing(true)}>Sửa</Button>}
            {task.permissions.canDelete && <Button variant="destructive" disabled={mutation.isPending} onClick={() => { if (window.confirm("Xóa công việc? Công việc còn chi tiêu liên kết không thể xóa.")) mutation.mutate("delete") }}>Xóa</Button>}
          </div>
          {mutation.error && <div role="alert" className="space-y-2 text-destructive"><p>{workError(mutation.error)}</p><p className="text-sm">Nếu còn chi tiêu, hãy bỏ liên kết trong từng chi tiêu trước khi xóa.</p><Button variant="outline" onClick={() => { mutation.reset(); void query.refetch() }}>Tải lại dữ liệu</Button></div>}
          <section className="space-y-2 border-t pt-3"><h3 className="font-semibold">Chi tiêu liên quan ({task.expenseCount})</h3>
            <QueryState loading={expenses.isLoading} error={expenses.error} retry={() => void expenses.refetch()} />
            {!expenses.isLoading && !expenses.error && !expenses.data?.data.items.length && <p className="text-sm text-muted-foreground">Chưa có chi tiêu liên quan.</p>}
            {expenses.data?.data.items.map(expense => <button key={expense.id} className="flex w-full items-center justify-between gap-2 rounded border p-3 text-left hover:bg-muted" onClick={() => update({ tab: "expenses", taskId: null, transactionId: String(expense.id) })}><span>{expense.description || `Chi tiêu #${expense.id}`}</span><span>{formatCurrency(expense.amount)}</span></button>)}
            <WorkPagination page={page} totalPages={expenses.data?.data.totalPages ?? 0} onChange={setPage} busy={expenses.isFetching} />
          </section>
        </div>}
      </DialogContent>
    </Dialog>
    {editing && task && <TaskForm groupId={groupId} task={task} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} />}
  </>
}
