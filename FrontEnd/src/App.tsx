import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/auth/LoginPage"
import ErrorPage from "./pages/error/ErrorPage"
import { Toaster } from "./components/ui/sonner"

const Dashboard = () => (
  <div className="flex h-screen items-center justify-center text-2xl font-bold">
    Chào mừng bạn đến với Trang Quản Trị!
  </div>
)

export function App() {
  return (
    <>
      {" "}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/403" element={<ErrorPage code={403} />} />
          <Route path="/500" element={<ErrorPage code={500} />} />

          <Route path="*" element={<ErrorPage code={404} />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
