export type TaskStatus = "todo" | "inProgress" | "done" | "cancelled"
export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "Cần làm", inProgress: "Đang làm", done: "Hoàn thành", cancelled: "Đã hủy",
}
export interface UserSummary { id: string; displayName: string; avatarUrl: string | null }
export interface TaskSummary {
  id: string
  title: string
  status: TaskStatus
  event: { id: string; title: string } | null
}
export interface TaskView extends TaskSummary {
  groupId: string
  description: string | null
  dueAt: string | null
  assignees: UserSummary[]
  expenseCount: number
  createdBy: UserSummary
  createdAt: string
  updatedAt: string
  version: string
}
export interface TaskDetails extends TaskView {
  permissions: { canEdit: boolean; canChangeStatus: boolean; canDelete: boolean }
}
export interface TaskInput {
  title: string
  description: string | null
  eventId: string | null
  dueAt: string | null
  assigneeIds: string[]
}
export interface TaskFilters {
  pageIndex: number
  pageSize: number
  search?: string
  status?: TaskStatus
  eventId?: string
  assigneeId?: string
  linkable?: boolean
}
