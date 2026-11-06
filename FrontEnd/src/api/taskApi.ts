import client from "@/axios/axiosInstance"
import type { ResponseDto } from "@/types/ResponseDto"
import type { PageResultResponse } from "@/types/PageResultResponse"
import type { TaskDetails, TaskFilters, TaskInput, TaskStatus, TaskView } from "@/types/task/Task"

const path = (groupId: number, id?: string) => `/groups/${groupId}/tasks${id ? `/${encodeURIComponent(id)}` : ""}`
export const versionHeaders = (version: string) => ({ "If-Match": version.startsWith('"') ? version : `"${version}"` })
export const taskApi = {
  list: async (groupId: number, params: TaskFilters) =>
    (await client.get<ResponseDto<PageResultResponse<TaskView>>>(path(groupId), { params, localErrors: true })).data.data,
  detail: async (groupId: number, id: string) =>
    (await client.get<ResponseDto<TaskDetails>>(path(groupId, id), { localErrors: true })).data.data,
  create: async (groupId: number, body: TaskInput) =>
    (await client.post<ResponseDto<TaskDetails>>(path(groupId), body, { localErrors: true })).data.data,
  update: async (groupId: number, id: string, version: string, body: Partial<TaskInput>) =>
    (await client.patch<ResponseDto<TaskDetails>>(path(groupId, id), body, { headers: versionHeaders(version), localErrors: true })).data.data,
  status: async (groupId: number, id: string, version: string, status: TaskStatus) =>
    (await client.patch<ResponseDto<TaskDetails>>(`${path(groupId, id)}/status`, { status }, { headers: versionHeaders(version), localErrors: true })).data.data,
  remove: async (groupId: number, id: string, version: string) => {
    await client.delete(path(groupId, id), { headers: versionHeaders(version), localErrors: true })
  },
}
