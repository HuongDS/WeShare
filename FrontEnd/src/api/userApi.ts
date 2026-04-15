import axiosClient from "@/axios/axiosInstance"
import type { ResponseDto } from "@/types/ResponseDto"
import type { DeleteAvatarDto } from "@/types/user/DeleteAvatarDto"
import type { UpdatePaymentDto } from "@/types/user/UpdatePaymentDto"
import type { UpdateUserDto } from "@/types/user/UpdateUserDto"
import type { UserViewDto } from "@/types/user/UserViewDto"

export const userApi = {
  getUserProfile: async () => {
    const res = await axiosClient.get<ResponseDto<UserViewDto>>("/user")
    return res.data
  },
  updateUserProfile: async (payload: UpdateUserDto) => {
    const res = await axiosClient.put<ResponseDto<UserViewDto>>(
      "/user",
      payload
    )
    return res.data
  },
  updateUserPaymentProfile: async (payload: UpdatePaymentDto) => {
    const res = await axiosClient.put<ResponseDto<object>>(
      "/user/payment-infor",
      payload
    )
    return res.data
  },
  updateAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await axiosClient.post<ResponseDto<UserViewDto>>(
      "/user/update-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return res.data
  },
  deleteAvatar: async (payload: DeleteAvatarDto) => {
    const res = await axiosClient.delete<ResponseDto<UserViewDto>>(
      "/user/delete-avatar",
      {
        data: payload,
      }
    )
    return res.data
  },
}
