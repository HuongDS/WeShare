import { transactionApi } from "@/api/transactionApi"
import { handleAxiosError } from "@/utils/HandleAxiosError"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export const useTransaction = () => {
  const addTransaction = useMutation({
    mutationFn: transactionApi.addTransaction,
    onSuccess: (res) => {
      toast.success(res.message || "Add transaction successfully!")
    },
    onError: (err) => {
      handleAxiosError(err, "Add transaction failed.")
    },
  })

  const updateTransaction = useMutation({
    mutationFn: transactionApi.updateTransaction,
    onSuccess: (res) => {
      toast.success(res.message || "Update transaction successfully!")
    },
    onError: (err) => {
      handleAxiosError(err, "Update transaction failed.")
    },
  })

  return {
    addTransaction,
    updateTransaction,
  }
}

export const useTransactionsDetails = (transactionId: number) => {
  const isPayer = useQuery({
    queryKey: ["isPayer", transactionId],
    queryFn: () => transactionApi.isPayer(transactionId),
    enabled: !!transactionId,
  })

  const getTransactionDetails = useQuery({
    queryKey: ["transactionDetails", transactionId],
    queryFn: () => transactionApi.getTransactionDetails(transactionId),
    enabled: !!transactionId,
  })
  return { isPayer, getTransactionDetails }
}

export const useGetTransactions = (
  pageSize: number,
  pageIndex: number,
  groupId?: number
) => {
  const getTransactionsByGroupId = useQuery({
    queryKey: ["transactionsByGroupId", groupId, pageSize, pageIndex],
    queryFn: () => {
      if (!groupId) {
        return null
      }
      return transactionApi.getTransactionsByGroupId(
        groupId,
        pageSize,
        pageIndex
      )
    },
    enabled: !!groupId,
  })
  return { getTransactionsByGroupId }
}

export const useGetMyTransactions = (pageSize: number, pageIndex: number) => {
  const myTransactions = useQuery({
    queryKey: ["myTransactions", pageSize, pageIndex],
    queryFn: () => transactionApi.getTransactionsByPayerId(pageSize, pageIndex),
  })
  return { myTransactions }
}

export const useDeleteTransaction = () => {
  const deleteTransaction = useMutation({
    mutationFn: transactionApi.deleteTransaction,
    onSuccess: (res) => {
      toast.success(res.message || "Delete transaction successfully!")
    },
    onError: (err) => {
      handleAxiosError(err, "Delete transaction failed.")
    },
  })
  return { deleteTransaction }
}

export const useTransactionSettlement = () => {
  const addSettlement = useMutation({
    mutationFn: transactionApi.addSingleSettlement,
    onSuccess: (res) => {
      toast.success(res.message || "Add settlement successfully!")
    },
    onError: (err) => {
      handleAxiosError(err, "Add settlement failed.")
    },
  })

  const addSettlements = useMutation({
    mutationFn: transactionApi.addMultiSettlement,
    onSuccess: (res) => {
      toast.success(res.message || "Add settlements successfully!")
    },
    onError: (err) => {
      handleAxiosError(err, "Add settlements failed.")
    },
  })
  return { addSettlement, addSettlements }
}
