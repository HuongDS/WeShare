import { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
