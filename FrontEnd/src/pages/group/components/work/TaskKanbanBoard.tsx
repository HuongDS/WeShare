import { useState } from "react"
import { Calendar, CheckCircle2, Clock, PlayCircle, Receipt, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { taskApi } from "@/api/taskApi"
import { useInvalidateWork } from "@/hooks/task/useTasks"
import type { TaskView, TaskStatus } from "@/types/task/Task"
import { taskStatusLabels } from "@/types/task/Task"
import { displayDate } from "./WorkShared"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface TaskKanbanBoardProps {
  groupId: number
  tasks: TaskView[]
  onSelectTask: (taskId: string) => void
}

const KANBAN_COLUMNS: { id: TaskStatus; label: string; icon: any; colorClass: string; borderClass: string }[] = [
  {
    id: "todo",
    label: "Cần làm",
    icon: Clock,
    colorClass: "bg-muted text-muted-foreground",
    borderClass: "border-border",
  },
  {
    id: "inProgress",
    label: "Đang làm",
    icon: PlayCircle,
    colorClass: "bg-blue-100 text-signal-blue dark:bg-blue-950/50 dark:text-blue-300",
    borderClass: "border-blue-400/40",
  },
  {
    id: "done",
    label: "Hoàn thành",
    icon: CheckCircle2,
    colorClass: "bg-linen-mist text-forest-ink dark:bg-emerald-950/50 dark:text-lime-voltage",
    borderClass: "border-emerald-500/40",
  },
]

export default function TaskKanbanBoard({
  groupId,
  tasks,
  onSelectTask,
}: TaskKanbanBoardProps) {
  const invalidate = useInvalidateWork()
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  const handleStatusChange = async (task: TaskView, newStatus: TaskStatus) => {
    if (task.status === newStatus) return
    setUpdatingTaskId(task.id)
    try {
      await taskApi.status(groupId, task.id, task.version, newStatus)
      await invalidate()
      toast.success(`Đã chuyển công việc sang ${taskStatusLabels[newStatus]}`)
    } catch {
      toast.error("Không thể cập nhật trạng thái")
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const getDeadlineStatus = (dueAt: string | null) => {
    if (!dueAt) return null
    const dueDate = new Date(dueAt)
    const now = new Date()
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) {
      return { label: "Quá hạn", style: "bg-alarm-red text-paper" }
    }
    if (diffHours < 24) {
      return { label: "Sắp đến hạn", style: "bg-amber-100 text-amber-900 border border-amber-300" }
    }
    return { label: displayDate(dueAt), style: "bg-muted text-muted-foreground" }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {KANBAN_COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id)
        const ColIcon = col.icon

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-3xl border border-border/80 bg-muted/20 p-4 min-h-[480px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <ColIcon className="h-4 w-4 text-forest-ink dark:text-lime-voltage" />
                <h4 className="font-bold text-sm tracking-tight text-foreground">
                  {col.label}
                </h4>
              </div>
              <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", col.colorClass)}>
                {columnTasks.length}
              </Badge>
            </div>

            {/* Task Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/60 rounded-2xl text-xs text-muted-foreground">
                  Chưa có công việc trong giai đoạn này
                </div>
              ) : (
                columnTasks.map((task) => {
                  const deadline = getDeadlineStatus(task.dueAt)
                  const isUpdating = updatingTaskId === task.id

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className={cn(
                        "group relative rounded-2xl border border-border/80 bg-card p-4 shadow-2xs hover:shadow-md hover:border-forest-ink/40 dark:hover:border-lime-voltage/40 transition-all cursor-pointer space-y-3",
                        isUpdating && "opacity-50 pointer-events-none"
                      )}
                    >
                      {/* Top: Event label & Status changer */}
                      <div className="flex items-center justify-between gap-2">
                        {task.event ? (
                          <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 max-w-[150px] truncate border-border">
                            {task.event.title}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Nhiệm vụ chung
                          </span>
                        )}

                        {/* Quick Status Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5 shadow-lg">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(task, "todo")
                              }}
                              className="rounded-xl text-xs gap-2 py-1.5 cursor-pointer"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Chuyển sang Cần làm
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(task, "inProgress")
                              }}
                              className="rounded-xl text-xs gap-2 py-1.5 cursor-pointer"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                              Chuyển sang Đang làm
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(task, "done")
                              }}
                              className="rounded-xl text-xs gap-2 py-1.5 cursor-pointer text-emerald-600 font-semibold"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đánh dấu Hoàn thành
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Title */}
                      <h5 className="font-bold text-sm text-foreground tracking-tight line-clamp-2 leading-snug group-hover:text-forest-ink dark:group-hover:text-lime-voltage transition-colors">
                        {task.title}
                      </h5>

                      {/* Meta badges: Deadline & Expenses */}
                      <div className="flex flex-wrap items-center gap-2">
                        {deadline && (
                          <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5 flex items-center gap-1", deadline.style)}>
                            <Calendar className="h-2.5 w-2.5" />
                            {deadline.label}
                          </span>
                        )}

                        {task.expenseCount > 0 && (
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-muted text-muted-foreground flex items-center gap-1">
                            <Receipt className="h-2.5 w-2.5" />
                            {task.expenseCount} khoản chi
                          </span>
                        )}
                      </div>

                      {/* Footer: Assignees */}
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center -space-x-2">
                          {task.assignees.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">
                              Chưa phân công
                            </span>
                          ) : (
                            task.assignees.map((user) => (
                              <Avatar key={user.id} className="h-6 w-6 border-2 border-background ring-1 ring-border/30">
                                <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                                <AvatarFallback className="bg-forest-ink text-lime-voltage text-[9px] font-bold">
                                  {user.displayName?.slice(0, 2).toUpperCase() || "US"}
                                </AvatarFallback>
                              </Avatar>
                            ))
                          )}
                        </div>

                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {task.assignees.length > 0 && `${task.assignees.length} người nhận`}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
