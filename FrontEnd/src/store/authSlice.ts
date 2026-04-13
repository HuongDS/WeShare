import type { User } from "@/types/user/User"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initAuthState: (state) => {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user)
          state.user = parsedUser
          state.isAuthenticated = true
        } catch {
          state.isAuthenticated = false
          state.user = null
        }
      }

      state.isInitialized = true
    },

    setAuthUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem("user", JSON.stringify(action.payload))
    },

    removeAuthUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
    },
  },
})

export const { initAuthState, setAuthUser, removeAuthUser } = authSlice.actions

export default authSlice.reducer
