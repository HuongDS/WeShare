import { useMutation } from "@tanstack/react-query"
import { disifyApi } from "@/api/disifyApi"
import { toast } from "sonner"
import axios from "axios"

export const useVerifyEmail = () => {
  const verifyMutation = useMutation({
    mutationFn: disifyApi.verifyEmail,
    onSuccess: (emailInfo) => {
      if (!emailInfo.format) {
        toast.error("Email sai định dạng!")
        return
      }

      if (!emailInfo.dns) {
        toast.error("Tên miền email này không tồn tại!")
        return
      }

      if (emailInfo.disposable) {
        toast.error("Vui lòng sử dụng email thật, không dùng email tạm thời!")
        return
      }

      toast.success("Email hợp lệ, bạn có thể sử dụng!")
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        console.error("Lỗi khi check email:", error.message)
      }
    },
  })

  return {
    verifyEmail: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    emailData: verifyMutation.data,
  }
}
