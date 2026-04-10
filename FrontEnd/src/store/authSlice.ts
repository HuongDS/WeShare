import type { User } from "@/types/user/User"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    removeAuthUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
    },
  },
})

export const { setAuthUser, removeAuthUser } = authSlice.actions

export default authSlice.reducer
