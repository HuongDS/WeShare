import { useNavigate } from "react-router-dom"
import { authApi } from "@/api/authApi"
import { removeAuthUser, setAuthUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { handleAxiosError } from "@/utils/HandleAxiosError"

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

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
      handleAxiosError(err, "Username or Password incorrect.")
    },
  })

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      toast.success(res.data || "Please check your email to confirm!")
    },
    onError: (err) => {
      handleAxiosError(err, "Register failed.")
    },
  })

  const verifyOtp = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (res) => {
      toast.success(res.data || "Register Successfully!")
    },
    onError: (err) => {
      handleAxiosError(err, "Verify failed.")
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
        navigate("/dashboard", { replace: true })
      }
    },
    onError: (err) => {
      handleAxiosError(err, "Please check your email again!")
    },
  })

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: (res) => {
      if (res.data) {
        toast.success(res.message || "Logged out successfully!")
      } else {
        toast.error(res.message || "Logout failed")
      }
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")

      dispatch(removeAuthUser())
      navigate("/auth", { replace: true })
    },
    onError: (err) => {
      handleAxiosError(err, "Logout failed.")
    },
  })

  const logoutAllDevices = useMutation({
    mutationFn: authApi.logoutAllDevices,
    onSuccess: (res) => {
      if (res.data) {
        toast.success(res.message || "Logged out from all devices!")
      } else {
        toast.error(res.message || "Logout failed")
      }
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")

      dispatch(removeAuthUser())
      navigate("/auth", { replace: true })
    },
    onError: (err) => {
      handleAxiosError(err, "Logout failed.")
    },
  })

  const forgotPassword = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (res) => {
      toast.success(res.data || "Password reset link sent to your email!")
    },
    onError: (err) => {
      handleAxiosError(err, "Failed to send reset link.")
    },
  })

  const resetPassword = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (res) => {
      toast.success(res.data || "Password reset successfully!")
    },
    onError: (err) => {
      handleAxiosError(err, "Failed to reset password.")
    },
  })

  return {
    login: login,
    isLoging: login.isPending,
    register,
    verifyOtp,
    logout,
    logoutAllDevices,
    loginWithGoogle,
    forgotPassword,
    resetPassword,
  }
}
