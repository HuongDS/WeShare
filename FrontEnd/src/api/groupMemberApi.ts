import axiosClient from "@/axios/axiosInstance"
import type { GroupMemberDetailsViewDto } from "@/types/groupMember/GroupMemberDetailsViewDto"
import type { PageResultResponse } from "@/types/PageResultResponse"
import type { ResponseDto } from "@/types/ResponseDto"

export const groupMemberApi = {
  getMyGroupMember: async (groupId: number) => {
    const res = await axiosClient.get<ResponseDto<GroupMemberDetailsViewDto>>(
      `/groupMember/group/me/${groupId}`
    )
    return res.data
  },
  getAllGroupMembers: async (groupId: number) => {
    const res = await axiosClient.get<
      ResponseDto<PageResultResponse<GroupMemberDetailsViewDto>>
    >(`/groupMember/group/${groupId}`)
    return res.data
  },
}
