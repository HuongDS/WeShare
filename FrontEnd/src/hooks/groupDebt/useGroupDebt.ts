import { groupDebtApi } from "@/api/groupDebtApi"
import { useQuery } from "@tanstack/react-query"

export const useGetMyGroupDebts = (groupId: number) => {
  const myGroupDebts = useQuery({
    queryKey: ["myGroupDebts", groupId],
    queryFn: () => groupDebtApi.getMyGroupDebts(groupId),
    enabled: !!groupId,
  })
  return { myGroupDebts }
}

export const useGetGroupDebtThatIAmOwed = (groupId: number) => {
  const groupDebtThatIAmOwed = useQuery({
    queryKey: ["groupDebtThatIAmOwed", groupId],
    queryFn: () => groupDebtApi.getGroupDebtThatIAmOwed(groupId),
    enabled: !!groupId,
  })
  return { groupDebtThatIAmOwed }
}
