import axiosClient from "@/axios/axiosInstance"
import type { ResponseDto } from "@/types/ResponseDto"
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
}
