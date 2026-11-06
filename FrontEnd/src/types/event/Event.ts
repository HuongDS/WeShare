import type { UserSummary } from "@/types/task/Task"
export interface EventInput {
  title: string
  description: string | null
  location: string | null
  startsAt: string
  endsAt: string
}
export interface EventView extends EventInput {
  id: string
  groupId: string
  taskCount: number
  completedTaskCount: number
  createdBy: UserSummary
  createdAt: string
  updatedAt: string
  version: string
}
export interface EventDetails extends EventView {
  permissions: { canEdit: boolean; canDelete: boolean }
}
export interface EventFilters {
  pageIndex: number
  pageSize: number
  search?: string
  from?: string
  to?: string
}
