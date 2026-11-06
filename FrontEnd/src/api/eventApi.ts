import client from "@/axios/axiosInstance"
import { versionHeaders } from "./taskApi"
import type { ResponseDto } from "@/types/ResponseDto"
import type { PageResultResponse } from "@/types/PageResultResponse"
import type { EventDetails, EventFilters, EventInput, EventView } from "@/types/event/Event"
const path = (groupId: number, id?: string) => `/groups/${groupId}/events${id ? `/${encodeURIComponent(id)}` : ""}`
export const eventApi = {
  list: async (groupId: number, params: EventFilters) =>
    (await client.get<ResponseDto<PageResultResponse<EventView>>>(path(groupId), { params, localErrors: true })).data.data,
  detail: async (groupId: number, id: string) =>
    (await client.get<ResponseDto<EventDetails>>(path(groupId, id), { localErrors: true })).data.data,
  create: async (groupId: number, body: EventInput) =>
    (await client.post<ResponseDto<EventDetails>>(path(groupId), body, { localErrors: true })).data.data,
  update: async (groupId: number, id: string, version: string, body: Partial<EventInput>) =>
    (await client.patch<ResponseDto<EventDetails>>(path(groupId, id), body, { headers: versionHeaders(version), localErrors: true })).data.data,
  remove: async (groupId: number, id: string, version: string) => {
    await client.delete(path(groupId, id), { headers: versionHeaders(version), localErrors: true })
  },
}
