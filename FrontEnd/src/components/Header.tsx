import { Search, Bell, Menu } from "lucide-react"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/expenses": "Expenses",
  "/groups": "Groups",
  "/settlements": "Settlements",
}

interface HeaderProps {
  onMobileMenuOpen?: () => void
}

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const location = useLocation()
  const pageTitle = location.pathname.startsWith("/groups/")
    ? "Group Details"
    : routeTitles[location.pathname] || "Dashboard"

  return (
    <header className="sticky top-4 z-50 mx-4 mt-4 h-14 rounded-full border border-slate-200 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-md transition-all duration-300 lg:mx-6">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Left Section: Mobile Hamburger + Page Title */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Mobile Hamburger - Only visible on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuOpen}
            className="flex-shrink-0 rounded-lg hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>

          {/* Page Title */}
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <h1 className="truncate text-base font-bold text-slate-900 md:text-lg lg:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right Section: Search Bar + Notification */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Search Bar - Hidden on mobile, expanded on sm and up */}
          <div className="hidden items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 transition-all duration-200 hover:border-slate-400 sm:flex">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-24 bg-transparent text-xs placeholder-slate-400 outline-none md:w-32"
            />
          </div>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-lg transition-all hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {/* Notification Badge */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 animate-pulse rounded-full bg-red-500" />
          </Button>

          {/* Search Icon for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg transition-all hover:bg-slate-100 sm:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>
    </header>
  )
}
