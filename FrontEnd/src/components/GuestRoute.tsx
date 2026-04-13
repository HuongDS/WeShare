import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"

interface GuestRouteProps {
  children: React.ReactNode
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
