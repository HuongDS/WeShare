import axiosClient from "@/axios/axiosInstance"
import type { BankDto } from "@/types/banks/BankDto"
import type { ResponseDto } from "@/types/ResponseDto"

export const banksApi = {
  getBanks: async () => {
    const ressponse = await axiosClient.get<ResponseDto<BankDto[]>>("/banks")
    return ressponse.data
  },
}
