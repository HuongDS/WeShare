import axiosClient from "@/axios/axiosInstance"
import type { PageResultResponse } from "@/types/PageResultResponse"
import type { ResponseDto } from "@/types/ResponseDto"
import type { AddOrRemoveMemberToGroupDto } from "@/types/group/AddOrRemoveMemberToGroupDto"
import type { CreateGroupDto } from "@/types/group/CreateGroupDto"
import type { GroupViewDto } from "@/types/group/GroupViewDto"
import type { UpdateGroupDto } from "@/types/group/UpdateGroupDto"
import type { UserViewDto } from "@/types/user/UserViewDto"

export const groupApi = {
  getGroup: async (groupId: number) => {
    const res = await axiosClient.get<ResponseDto<GroupViewDto>>(
      `/group/${groupId}`
    )
    return res.data
  },
  getGroups: async (pageSize: number, pageIndex: number) => {
    const res = await axiosClient.get<
      ResponseDto<PageResultResponse<GroupViewDto>>
    >(`/group/groups/${pageSize}/${pageIndex}`)
    return res.data
  },
  createGroup: async (payload: CreateGroupDto) => {
    const apiPayload = {
      ...payload,
    }
    const res = await axiosClient.post<ResponseDto<GroupViewDto>>(
      "/group",
      apiPayload
    )
    return res.data
  },
  addMembers: async (payload: AddOrRemoveMemberToGroupDto) => {
    const res = await axiosClient.post<ResponseDto<GroupViewDto>>(
      "/group/add-members",
      payload
    )
    return res.data
  },
  removeMembers: async (payload: AddOrRemoveMemberToGroupDto) => {
    const res = await axiosClient.delete<ResponseDto<GroupViewDto>>(
      "/group/members",
      {
        data: payload,
      }
    )
    return res.data
  },
  updateGroup: async (payload: UpdateGroupDto) => {
    const res = await axiosClient.put<ResponseDto<GroupViewDto>>(
      "/group",
      payload
    )
    return res.data
  },
  deleteGroup: async (groupId: number) => {
    const res = await axiosClient.delete<ResponseDto<object>>(
      `/group/${groupId}`
    )
    return res.data
  },
  getMemberGroups: async (groupId: number) => {
    const res = await axiosClient.get<ResponseDto<UserViewDto[]>>(
      `/group/members/${groupId}`
    )
    return res.data
  },
}
