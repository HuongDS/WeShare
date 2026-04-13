import axiosClient from "@/axios/axiosInstance"
import type { GoogleLoginDto } from "@/types/auth/GoogleLoginDto"
import type { LoginRequest } from "@/types/auth/LoginRequest"
import type { LoginResponse } from "@/types/auth/LoginResponse"
import type { RegisterDto } from "@/types/auth/RegisterDto"
import type { TokenRequestDto } from "@/types/auth/TokenRequestDto"
import type { VerifyOtpDto } from "@/types/auth/VerifyOtpDto"
import type { ResponseDto } from "@/types/ResponseDto"

export const authApi = {
  login: async (payload: LoginRequest) => {
    const response = await axiosClient.post<ResponseDto<LoginResponse>>(
      "/auth/login",
      payload
    )
    return response.data
  },
  register: async (payload: RegisterDto) => {
    const res = await axiosClient.post<ResponseDto<string>>(
      "/auth/register",
      payload
    )
    return res.data
  },
  verifyOtp: async (payload: VerifyOtpDto) => {
    const res = await axiosClient.post<ResponseDto<string>>(
      "/auth/verify-otp",
      payload
    )
    return res.data
  },
  loginWithGoogle: async (payload: GoogleLoginDto) => {
    const res = await axiosClient.post<ResponseDto<LoginResponse>>(
      "/auth/google",
      payload
    )
    return res.data
  },
  logout: async (payload: TokenRequestDto) => {
    const res = await axiosClient.post<ResponseDto<boolean>>(
      "/auth/logout",
      payload
    )
    return res.data
  },
  logoutAllDevices: async () => {
    const res = await axiosClient.post<ResponseDto<boolean>>(
      "/auth/logout-all-devices"
    )
    return res.data
  },
}
