import axiosClient from "@/axios/axiosInstance"
import type { GroupDebtViewDto } from "@/types/groupDebt/GroupDebtViewDto"
import type { ResponseDto } from "@/types/ResponseDto"

export const groupDebtApi = {
  getMyGroupDebts: async (groupId: number) => {
    const res = await axiosClient.get<ResponseDto<GroupDebtViewDto[]>>(
      `/GroupDebt/me/${groupId}`
    )
    return res.data
  },
  getGroupDebtThatIAmOwed: async (groupId: number) => {
    const res = await axiosClient.get<ResponseDto<GroupDebtViewDto[]>>(
      `/GroupDebt/my-owe/${groupId}`
    )
    return res.data
  },
  remindDebt: async (debtId: number) => {
    const res = await axiosClient.post<ResponseDto<object>>(
      `/GroupDebt/${debtId}/remind`
    )
    return res.data
  },
}
