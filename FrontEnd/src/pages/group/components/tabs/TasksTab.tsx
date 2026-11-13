import { useState } from "react"
import { Plus, LayoutGrid, List, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTasks } from "@/hooks/task/useTasks"
import { useGetGroupMembers } from "@/hooks/group/useGroup"
import { taskStatusLabels, type TaskStatus } from "@/types/task/Task"
import TaskForm from "../work/TaskForm"
import TaskDetail from "../work/TaskDetail"
import TaskKanbanBoard from "../work/TaskKanbanBoard"
import { EventPicker } from "../work/WorkPicker"
import { displayDate, QueryState, useWorkNavigation, WorkPagination } from "../work/WorkShared"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export default function TasksTab({ groupId }: { groupId: number }) {
  const { params, update } = useWorkNavigation()
  const [creating, setCreating] = useState(false)
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")

  const page = Math.max(1, Number(params.get("taskPage")) || 1)
  const search = params.get("taskSearch") ?? ""
  const status = params.get("taskStatus") ?? ""
  const eventId = params.get("taskEvent") ?? ""
  const assigneeId = params.get("taskAssignee") ?? ""

  const query = useTasks(groupId, {
    pageIndex: page,
    pageSize: 30,
    search: search.trim(),
    status: status in taskStatusLabels ? (status as TaskStatus) : undefined,
    eventId: eventId || undefined,
    assigneeId: assigneeId || undefined,
  })

  const { members } = useGetGroupMembers(groupId)
  const filter = (values: Record<string, string | null>) =>
    update({ ...values, taskPage: null }, true)

  const tasks = query.data?.items || []

  return (
    <div className="space-y-5 pt-2">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Quản lý Công việc Nhóm
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phân công nhiệm vụ, theo dõi tiến độ và liên kết chi tiêu với hoạt động nhóm
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "kanban"
                  ? "bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Bảng Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "list"
                  ? "bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              Danh sách
            </button>
          </div>

          <Button
            onClick={() => setCreating(true)}
            className="rounded-full bg-lime-voltage text-forest-ink hover:bg-lime-400 font-extrabold text-xs h-9 px-4 gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Tạo công việc
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-card border border-border">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Tìm kiếm công việc"
            placeholder="Tìm kiếm công việc..."
            maxLength={200}
            value={search}
            onChange={(e) => filter({ taskSearch: e.target.value })}
            className="rounded-full pl-8 h-9 text-xs bg-background"
          />
        </div>

        {/* Status filter */}
        <select
          aria-label="Lọc trạng thái"
          className="h-9 rounded-full border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-forest-ink"
          value={status}
          onChange={(e) => filter({ taskStatus: e.target.value })}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(taskStatusLabels).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        {/* Assignee filter */}
        <select
          aria-label="Lọc người nhận việc"
          className="h-9 rounded-full border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-forest-ink"
          value={assigneeId}
          onChange={(e) => filter({ taskAssignee: e.target.value })}
        >
          <option value="">Tất cả người thực hiện</option>
          {members.data?.data?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
      </div>

      <EventPicker
        groupId={groupId}
        value={
          eventId
            ? { id: eventId, title: params.get("taskEventTitle") || "Selected Event" }
            : null
        }
        onChange={(event) =>
          filter({
            taskEvent: event?.id ?? null,
            taskEventTitle: event?.title ?? null,
          })
        }
      />

      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => void query.refetch()}
      />

      {/* Main Content: Kanban or List */}
      {!query.isLoading && !query.error && tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/10 p-12 text-center space-y-3">
          <p className="text-base font-bold text-foreground">Không có công việc nào phù hợp với bộ lọc.</p>
          <p className="text-xs text-muted-foreground">
            Tạo công việc để phân chia nhiệm vụ cho các thành viên trong nhóm.
          </p>
          <Button
            onClick={() => setCreating(true)}
            className="rounded-full bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink text-xs font-bold"
          >
            Tạo công việc
          </Button>
        </div>
      ) : viewMode === "kanban" ? (
        <TaskKanbanBoard
          groupId={groupId}
          tasks={tasks}
          onSelectTask={(id) => update({ taskId: id })}
        />
      ) : (
        /* List View */
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => update({ taskId: task.id })}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card hover:border-forest-ink/40 dark:hover:border-lime-voltage/40 transition-all cursor-pointer shadow-2xs"
            >
              <div className="space-y-1 min-w-0">
                <h4 className="font-bold text-sm text-foreground truncate group-hover:text-forest-ink dark:group-hover:text-lime-voltage transition-colors">
                  {task.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {taskStatusLabels[task.status]}
                  </Badge>
                  {task.dueAt && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3 w-3" />
                      {displayDate(task.dueAt)}
                    </span>
                  )}
                  {task.expenseCount > 0 && (
                    <span>• {task.expenseCount} khoản chi liên kết</span>
                  )}
                  {task.event && <span>• Sự kiện: {task.event.title}</span>}
                </div>
              </div>

              {/* Assignees */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {task.assignees.map((u) => (
                    <Avatar key={u.id} className="h-7 w-7 border-2 border-background">
                      <AvatarImage src={u.avatarUrl || undefined} alt={u.displayName} />
                      <AvatarFallback className="bg-forest-ink text-lime-voltage text-[10px] font-bold">
                        {u.displayName?.slice(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <WorkPagination
        page={page}
        totalPages={query.data?.totalPages ?? 0}
        onChange={(next) => update({ taskPage: String(next) })}
        busy={query.isFetching}
      />

      {/* Forms & Details */}
      {creating && (
        <TaskForm
          groupId={groupId}
          onClose={() => setCreating(false)}
          onSaved={(newTaskId) => {
            setCreating(false)
            update({ taskId: newTaskId })
          }}
        />
      )}

      {params.get("taskId") && (
        <TaskDetail
          key={params.get("taskId")}
          groupId={groupId}
          id={params.get("taskId")!}
        />
      )}
    </div>
  )
}
