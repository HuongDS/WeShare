import { userApi } from "@/api/userApi"
import { setAuthUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import { handleAxiosError } from "@/utils/HandleAxiosError"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useUser = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const getUserProfile = useQuery({
    queryKey: ["userProfile"],
    queryFn: userApi.getUserProfile,
  })

  const updateUserProfile = useMutation({
    mutationFn: userApi.updateUserProfile,
    onSuccess: (res) => {
      toast.success(res.message || "Update profile successfully!")
      const user = res.data
      dispatch(
        setAuthUser({
          userId: user.id,
          userName: user.fullName,
        })
      )
      queryClient.invalidateQueries({ queryKey: ["userProfile"] })
    },
    onError: (err) => {
      handleAxiosError(err, "Update profile failed.")
    },
  })

  const updateUserPaymentProfile = useMutation({
    mutationFn: userApi.updateUserPaymentProfile,
    onSuccess: (res) => {
      toast.success(res.message || "Update payment profile successfully!")
      queryClient.invalidateQueries({ queryKey: ["userProfile"] })
    },
    onError: (err) => {
      handleAxiosError(err, "Update payment profile failed.")
    },
  })

  return {
    getUserProfile: getUserProfile,
    updateUserProfile: updateUserProfile,
    updateUserPaymentProfile: updateUserPaymentProfile,
  }
}
