import { groupMemberApi } from "@/api/groupMemberApi"
import { useQuery } from "@tanstack/react-query"

export const useGetMyDebts = (groupId: number) => {
  const myDebtMembers = useQuery({
    queryKey: ["myDebts", groupId],
    queryFn: () => groupMemberApi.getMyGroupMember(groupId),
    enabled: !!groupId,
  })
  return { myDebtMembers }
}

export const useGetAllGroupMembers = (groupId: number) => {
  const allGroupMembers = useQuery({
    queryKey: ["allGroupMembers", groupId],
    queryFn: () => groupMemberApi.getAllGroupMembers(groupId),
    enabled: !!groupId,
  })
  return { allGroupMembers }
}
