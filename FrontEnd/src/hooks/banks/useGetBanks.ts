import { banksApi } from "@/api/banksApi"
import { useQuery } from "@tanstack/react-query"

export const useGetAllBanks = () => {
  const getBanks = useQuery({
    queryKey: ["banks"],
    queryFn: banksApi.getBanks,
  })

  return {
    getBanks: getBanks,
  }
}
