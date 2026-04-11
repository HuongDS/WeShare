import axios from "axios"

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

        const { data } = await axios.post(API_URL + "/auth/refresh-token", {
          accessToken: accessToken, // Backend .NET thường yêu cầu gửi cả token cũ
          refreshToken: refreshToken, // và refresh token
        })

        const newAccessToken = data.token // hoặc data.accessToken tùy backend của bạn đặt tên
        const newRefreshToken = data.refreshToken

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

        // Đá người dùng về trang đăng nhập
        window.location.href = "/" // Đổi thành link trang Login của bạn

        return Promise.reject(refreshError)
      } finally {
        // Hoàn thành quá trình refresh
        isRefreshing = false
      }
    }

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
