import axiosClient from "@/axios/axiosInstance"
import type { PageResultResponse } from "@/types/PageResultResponse"
import type { ResponseDto } from "@/types/ResponseDto"
import type { CreateSettlementDto } from "@/types/transaction/CreateSettlementDto"
import type { CreateTransactionDto } from "@/types/transaction/CreateTransactionDto"
import type { TransactionViewDto } from "@/types/transaction/TransactionViewDto"
import type { UpdateTransactionDto } from "@/types/transaction/UpdateTransactionDto"

export const transactionApi = {
  addTransaction: async (payload: CreateTransactionDto) => {
    const res = await axiosClient.post<ResponseDto<TransactionViewDto>>(
      "/transaction",
      payload
    )
    return res.data
  },
  isPayer: async (transactionId: number) => {
    const res = await axiosClient.get<ResponseDto<boolean>>(
      `/transaction/${transactionId}/is-payer`
    )
    return res.data
  },
  updateTransaction: async (payload: UpdateTransactionDto) => {
    const res = await axiosClient.put<ResponseDto<TransactionViewDto>>(
      "/transaction",
      payload
    )
    return res.data
  },
  getTransactionDetails: async (transactionId: number) => {
    const res = await axiosClient.get<ResponseDto<TransactionViewDto>>(
      `/transaction/${transactionId}`
    )
    return res.data
  },
  getTransactionsByGroupId: async (
    groupId: number,
    pageSize: number,
    pageIndex: number
  ) => {
    const res = await axiosClient.get<
      ResponseDto<PageResultResponse<TransactionViewDto>>
    >(`/transaction/group/${groupId}`, {
      params: {
        pageSize,
        pageIndex,
      },
    })
    return res.data
  },
  getTransactionsByPayerId: async (pageSize: number, pageIndex: number) => {
    const res = await axiosClient.get<
      ResponseDto<PageResultResponse<TransactionViewDto>>
    >(`/transaction/me`, {
      params: {
        pageSize,
        pageIndex,
      },
    })
    return res.data
  },
  deleteTransaction: async (transactionId: number) => {
    const res = await axiosClient.delete<ResponseDto<boolean>>(
      `/transaction/${transactionId}`
    )
    return res.data
  },
  addSingleSettlement: async (payload: CreateSettlementDto) => {
    const res = await axiosClient.post<ResponseDto<number>>(
      "/transaction/single-settlement",
      payload
    )
    return res.data
  },
  addMultiSettlement: async (payload: CreateSettlementDto[]) => {
    const res = await axiosClient.post<ResponseDto<number[]>>(
      "/transaction/multi-settlement",
      payload
    )
    return res.data
  },
}
