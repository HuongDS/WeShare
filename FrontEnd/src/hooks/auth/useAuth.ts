import { authApi } from "@/api/authApi"
import { removeAuthUser, setAuthUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

export const useAuth = () => {
  const dispatch = useAppDispatch()

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      if (res.status === 200 && res.data) {
        const { accessToken, refreshToken, userId, userName } = res.data
        localStorage.setItem("token", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        toast.success(res.message || "Login successfully!")

        dispatch(
          setAuthUser({
            userId: userId,
            userName: userName,
          })
        )
      }
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Username or Password incorrect."
        toast.error(errorMessage)
      } else {
        toast.error("Some thing went wrong!")
      }
    },
  })

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      toast.success(res.data || "Please check your email to confirm!")
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Register failed.")
      } else {
        toast.error("Some thing went wrong!")
      }
    },
  })

  const verifyOtp = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (res) => {
      toast.success(res.data || "Register Successfully!")
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Verify failed.")
      } else {
        toast.error("Some thing went wrong!")
      }
    },
  })

  const loginWithGoogle = useMutation({
    mutationFn: authApi.loginWithGoogle,
    onSuccess: (res) => {
      if (res.status === 200 && res.data) {
        const { accessToken, refreshToken, userId, userName } = res.data
        localStorage.setItem("token", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        toast.success(res.message || "Login successfully!")
        dispatch(
          setAuthUser({
            userId: userId,
            userName: userName,
          })
        )
      }
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Please check your email again!"
        toast.error(errorMessage)
      } else {
        toast.error("Some thing went wrong!")
      }
    },
  })

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: (res) => {
      if (res.data) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")

      dispatch(removeAuthUser())
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || "Logout Failed"
        toast.error(errorMessage)
      } else {
        toast.error("Some thing went wrong!")
      }
    },
  })

  const logoutAllDevices = useMutation({
    mutationFn: authApi.logoutAllDevices,
    onSuccess: (res) => {
      if (res.data) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || "Logout Failed"
        toast.error(errorMessage)
      } else {
        toast.error("Some thing went wrong!")
      }
    },
  })

  return {
    login: login.mutateAsync,
    isLoging: login.isPending,
    register: register.mutateAsync,
    verifyOtp: verifyOtp.mutateAsync,
    loginWithGoogle: loginWithGoogle.mutateAsync,
    logout: logout.mutateAsync,
    logoutAllDevices: logoutAllDevices.mutateAsync,
  }
}
