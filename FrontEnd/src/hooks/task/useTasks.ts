import { useQuery, useQueryClient } from "@tanstack/react-query"
import { taskApi } from "@/api/taskApi"
import { eventApi } from "@/api/eventApi"
import type { TaskFilters } from "@/types/task/Task"
import type { EventFilters } from "@/types/event/Event"

export const useTasks = (groupId: number, filters: TaskFilters, enabled = true) => useQuery({
  queryKey: ["tasks", groupId, filters], queryFn: () => taskApi.list(groupId, filters), enabled: !!groupId && enabled,
})
export const useTask = (groupId: number, id: string) => useQuery({
  queryKey: ["task", groupId, id], queryFn: () => taskApi.detail(groupId, id), enabled: !!id && !!groupId, retry: false,
})
export const useEvents = (groupId: number, filters: EventFilters, enabled = true) => useQuery({
  queryKey: ["events", groupId, filters], queryFn: () => eventApi.list(groupId, filters), enabled: !!groupId && enabled,
})
export const useEvent = (groupId: number, id: string) => useQuery({
  queryKey: ["event", groupId, id], queryFn: () => eventApi.detail(groupId, id), enabled: !!id && !!groupId, retry: false,
})
export const relatedQueryRoots = ["tasks", "task", "events", "event", "transactionsByGroupId", "myTransactions", "transactionDetails", "transactionsByPayerId", "taskExpenses"]
export function useInvalidateWork() {
  const client = useQueryClient()
  return () => Promise.all(relatedQueryRoots.map(root => client.invalidateQueries({ queryKey: [root] })))
}
