import axios from "axios"

// Feature forms handle permission/server errors inline without losing draft input.
declare module "axios" {
  interface AxiosRequestConfig { localErrors?: boolean }
}

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7133/api"

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

let isRefreshing = false
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token
            return axiosClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        const accessToken = localStorage.getItem("token")

        if (!refreshToken || !accessToken) {
          throw new Error("Không tìm thấy token")
        }

        const { data } = await axios.post(API_URL + "/auth/refresh", {
          refreshToken: refreshToken,
        })

        const authPayload = data?.data || data
        const newAccessToken = authPayload?.accessToken || authPayload?.token
        const newRefreshToken = authPayload?.refreshToken

        if (!newAccessToken || !newRefreshToken) {
          throw new Error("Refresh token response invalid")
        }

        // Lưu lại vào Local Storage
        localStorage.setItem("token", newAccessToken)
        localStorage.setItem("refreshToken", newRefreshToken)

        // Cập nhật lại token mới cho request đang bị lỗi ban nãy và gọi lại nó
        axiosClient.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return axiosClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        // NẾU REFRESH TOKEN CŨNG BỊ LỖI (Ví dụ: Refresh token hết hạn nốt)
        // Bắt buộc người dùng phải đăng nhập lại từ đầu
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Đá người dùng về trang đăng nhập
        window.location.href = "/auth"

        return Promise.reject(refreshError)
      } finally {
        // Hoàn thành quá trình refresh
        isRefreshing = false
      }
    }

    if (originalRequest?.localErrors) return Promise.reject(error)

    if (error.response?.status === 403) {
      window.location.href = "/403"
    }

    if (error.response?.status >= 500) {
      window.location.href = "/500"
    }

    return Promise.reject(error)
  }
)

export default axiosClient
