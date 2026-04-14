import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { initAuthState } from "@/store/authSlice"
import { Toaster } from "./components/ui/sonner"
import { Loader2 } from "lucide-react"
import React, { Suspense } from "react"
import ProtectedRoute from "./components/ProtectedRoute"
import GuestRoute from "./components/GuestRoute"
import MainLayout from "./components/MainLayout"

const LoginPageLazy = React.lazy(() => import("./pages/auth/LoginPage"))
const ErrorPageLazy = React.lazy(() => import("./pages/error/ErrorPage"))
const VerifyOtpPageLazy = React.lazy(() => import("./pages/auth/VerifyOtpPage"))
const ForgotPasswordPageLazy = React.lazy(
  () => import("./pages/auth/ForgotPasswordPage")
)
const ResetPasswordPageLazy = React.lazy(
  () => import("./pages/auth/ResetPasswordPage")
)
const DashboardPageLazy = React.lazy(() => import("./pages/user/DashboardPage"))
const UserProfilePageLazy = React.lazy(
  () => import("./pages/user/UserProfilePage")
)

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

export function App() {
  const dispatch = useAppDispatch()
  const { isInitialized } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(initAuthState())
  }, [dispatch])

  if (!isInitialized) {
    return <PageLoader />
  }

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />

            <Route
              path="/auth"
              element={
                <GuestRoute>
                  <LoginPageLazy />
                </GuestRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <GuestRoute>
                  <VerifyOtpPageLazy />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPasswordPageLazy />
                </GuestRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <GuestRoute>
                  <ResetPasswordPageLazy />
                </GuestRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPageLazy />} />
              <Route path="/profile" element={<UserProfilePageLazy />} />
            </Route>

            {/* Error Pages */}
            <Route path="/403" element={<ErrorPageLazy code={403} />} />
            <Route path="/500" element={<ErrorPageLazy code={500} />} />
            <Route path="*" element={<ErrorPageLazy code={404} />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
