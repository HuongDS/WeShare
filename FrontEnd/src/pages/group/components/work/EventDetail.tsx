import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { eventApi } from "@/api/eventApi"
import { useEvent, useInvalidateWork, useTasks } from "@/hooks/task/useTasks"
import { useGetGroupMembers } from "@/hooks/group/useGroup"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  Receipt,
  ListTodo,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react"
import { taskStatusLabels } from "@/types/task/Task"
import { displayDate, QueryState, useWorkNavigation, WorkPagination } from "./WorkShared"
import TaskForm from "./TaskForm"
import EventForm from "./EventForm"

export default function EventDetail({ groupId, id }: { groupId: number; id: string }) {
  const query = useEvent(groupId, id)
  const event = query.data
  const { update } = useWorkNavigation()
  const [editing, setEditing] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<"tasks" | "participants" | "expenses">("tasks")

  const tasks = useTasks(groupId, { pageIndex: page, pageSize: 10, eventId: id }, !!event)
  const { members } = useGetGroupMembers(groupId)
  const invalidate = useInvalidateWork()

  const mutation = useMutation({
    mutationFn: () => eventApi.remove(groupId, id, event!.version),
    onSuccess: () => {
      void invalidate()
      update({ eventId: null })
    },
  })

  const groupMemberList = members.data?.data || []
  const taskCount = event?.taskCount || 0
  const completedTaskCount = event?.completedTaskCount || 0
  const completionPercent = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) update({ eventId: null })
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-3xl p-0 border border-border">
          {/* Hero Banner Header */}
          <div className="bg-forest-ink text-paper dark:bg-card p-6 pb-5 rounded-t-3xl border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-lime-voltage">
                  Lịch trình &amp; Phối hợp sự kiện
                </span>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold text-white dark:text-foreground tracking-tight">
                  {event?.title ?? "Chi tiết sự kiện"}
                </DialogTitle>
              </div>

              {event && (
                <div className="flex items-center gap-1.5">
                  {event.permissions.canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(true)}
                      className="h-8 w-8 rounded-full text-paper hover:bg-spruce dark:text-foreground dark:hover:bg-muted"
                      title="Chỉnh sửa sự kiện"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {event.permissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={mutation.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Bạn có chắc muốn xóa sự kiện này? Hãy đảm bảo các công việc liên quan đã được chuyển giao."
                          )
                        ) {
                          mutation.mutate()
                        }
                      }}
                      className="h-8 w-8 rounded-full text-alarm-red hover:bg-alarm-red/20"
                      title="Xóa sự kiện"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <DialogDescription className="text-linen-mist/80 dark:text-muted-foreground text-xs mt-1">
              {event?.description || "Chưa có mô tả chi tiết cho sự kiện này."}
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            <QueryState
              loading={query.isLoading}
              error={query.error}
              retry={() => void query.refetch()}
            />

            {event && !query.error && (
              <div className="space-y-6">
                {/* Timeline & Metadata Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Timeline Card */}
                  <div className="rounded-2xl border border-border p-3.5 bg-muted/20 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-forest-ink dark:text-lime-voltage" />
                      Thời gian diễn ra
                    </span>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-foreground">
                        Bắt đầu: <span className="text-muted-foreground font-normal">{displayDate(event.startsAt)}</span>
                      </p>
                      <p className="font-semibold text-foreground">
                        Kết thúc: <span className="text-muted-foreground font-normal">{displayDate(event.endsAt)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Location & Host Card */}
                  <div className="rounded-2xl border border-border p-3.5 bg-muted/20 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-forest-ink dark:text-lime-voltage" />
                      Địa điểm &amp; Người tạo
                    </span>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-foreground truncate">
                        Địa điểm: <span className="text-muted-foreground font-normal">{event.location || "Trực tuyến / Chưa rõ"}</span>
                      </p>
                      <p className="font-semibold text-foreground">
                        Người tạo: <span className="text-muted-foreground font-normal">{event.createdBy?.displayName || "Trưởng nhóm"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 rounded-2xl bg-muted/30 p-4 border border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-lime-voltage" />
                      Tiến độ hoàn thành
                    </span>
                    <span className="font-extrabold text-forest-ink dark:text-lime-voltage">
                      {completedTaskCount} / {taskCount} ({completionPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-forest-ink dark:bg-lime-voltage transition-all duration-500 rounded-full"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Navigation Tabs for Tasks, Participants, Expenses */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
                  <TabsList className="grid grid-cols-3 rounded-full bg-muted p-1">
                    <TabsTrigger
                      value="tasks"
                      className="rounded-full text-xs font-semibold gap-1.5 data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                    >
                      <ListTodo className="h-3.5 w-3.5" />
                      Công việc ({taskCount})
                    </TabsTrigger>
                    <TabsTrigger
                      value="participants"
                      className="rounded-full text-xs font-semibold gap-1.5 data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Thành viên ({groupMemberList.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="expenses"
                      className="rounded-full text-xs font-semibold gap-1.5 data-[state=active]:bg-forest-ink data-[state=active]:text-lime-voltage dark:data-[state=active]:bg-lime-voltage dark:data-[state=active]:text-forest-ink"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Khoản chi
                    </TabsTrigger>
                  </TabsList>

                  {/* Tasks Tab Content */}
                  <TabsContent value="tasks" className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">
                        Công việc thuộc sự kiện
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => setCreatingTask(true)}
                        className="rounded-full bg-lime-voltage text-forest-ink hover:bg-lime-400 font-bold text-xs h-8 px-3 gap-1 shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm việc
                      </Button>
                    </div>

                    <QueryState
                      loading={tasks.isLoading}
                      error={tasks.error}
                      retry={() => void tasks.refetch()}
                    />

                    {!tasks.isLoading && !tasks.error && !tasks.data?.items.length ? (
                      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-muted/10">
                        Chưa có công việc nào liên kết với sự kiện này.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.data?.items.map((task) => (
                          <div
                            key={task.id}
                            onClick={() =>
                              update({ tab: "tasks", eventId: null, taskId: task.id })
                            }
                            className="group flex items-center justify-between p-3 rounded-2xl border border-border bg-card hover:border-forest-ink/40 dark:hover:border-lime-voltage/40 cursor-pointer transition-all shadow-2xs"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-bold text-sm text-foreground truncate group-hover:text-forest-ink dark:group-hover:text-lime-voltage">
                                {task.title}
                              </p>
                              <span className="text-[11px] text-muted-foreground">
                                {task.assignees.length} người nhận • {task.expenseCount} khoản chi
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="rounded-full text-[10px]">
                                {taskStatusLabels[task.status]}
                              </Badge>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <WorkPagination
                      page={page}
                      totalPages={tasks.data?.totalPages ?? 0}
                      onChange={setPage}
                      busy={tasks.isFetching}
                    />
                  </TabsContent>

                  {/* Participants Tab Content */}
                  <TabsContent value="participants" className="space-y-3 pt-1">
                    <h4 className="text-sm font-bold text-foreground">
                      Thành viên tham gia sự kiện
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {groupMemberList.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-border bg-card"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-forest-ink text-lime-voltage text-xs font-bold">
                              {m.fullName?.slice(0, 2).toUpperCase() || "US"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {m.fullName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              ID: {m.id}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Expenses Tab Content */}
                  <TabsContent value="expenses" className="space-y-3 pt-1">
                    <div className="rounded-2xl border border-border p-5 bg-muted/20 text-center space-y-2">
                      <Receipt className="h-8 w-8 text-forest-ink dark:text-lime-voltage mx-auto" />
                      <h4 className="text-sm font-bold text-foreground">
                        Theo dõi chi tiêu sự kiện
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Tất cả các khoản chi tiêu liên kết với công việc thuộc sự kiện này sẽ được tự động tổng hợp trong Bảng chi tiêu nhóm.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => update({ tab: "expenses", eventId: null })}
                        className="rounded-full bg-forest-ink text-paper dark:bg-lime-voltage dark:text-forest-ink text-xs font-bold mt-2"
                      >
                        Mở Bảng chi tiêu nhóm
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editing && event && (
        <EventForm
          groupId={groupId}
          event={event}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      )}

      {creatingTask && event && (
        <TaskForm
          groupId={groupId}
          initialEvent={{ id: event.id, title: event.title }}
          onClose={() => setCreatingTask(false)}
          onSaved={(newTaskId) => {
            setCreatingTask(false)
            update({ tab: "tasks", eventId: null, taskId: newTaskId })
          }}
        />
      )}
    </>
  )
}
