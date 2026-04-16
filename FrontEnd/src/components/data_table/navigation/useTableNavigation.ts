import { useContext } from "react"
import { TableNavigationContext } from "./TableNavigationContext"

export function useTableNavigation() {
  const context = useContext(TableNavigationContext)

  if (!context) {
    throw new Error(
      "useTableNavigation must be used within TableNavigationProvider"
    )
  }

  return context
}
