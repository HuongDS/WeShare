import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Receipt,
  Users,
  Handshake,
  LogOut,
  ShieldAlert,
  Zap,
  Settings,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/auth/useAuth"
import type { RootState } from "@/store/store"

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: <Receipt className="h-5 w-5" />,
    href: "/expenses",
  },
  {
    id: "groups",
    label: "Groups",
    icon: <Users className="h-5 w-5" />,
    href: "/groups",
  },
  {
    id: "settlements",
    label: "Settlements",
    icon: <Handshake className="h-5 w-5" />,
    href: "/settlements",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <Settings className="h-5 w-5" />,
    href: "/profile",
  },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: (state: boolean) => void
  isMobile: boolean
  onMobileClose?: () => void
  isMobileView?: boolean
}

export default function Sidebar({
  isOpen,
  isMobile,
  onMobileClose,
  isMobileView = false,
}: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth)
  const { logout, logoutAllDevices } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(isMobileView ? true : !isMobile)

  const isActive = (href?: string) => {
    if (!href) return false
    return location.pathname === href
  }

  const handleLogout = async () => {
    await logout.mutateAsync({
      refreshToken: localStorage.getItem("refreshToken") || "",
    })
  }

  const handleLogoutAll = async () => {
    await logoutAllDevices.mutateAsync()
  }

  const handleMenuItemClick = (id: string, href?: string) => {
    if (href) {
      navigate(href)
    }
    if (isMobile) {
      onMobileClose?.()
    }
  }

  const toggleSidebar = () => {
    if (!isMobileView) {
      setIsExpanded(!isExpanded)
    }
  }

  const sidebarWidth = isMobileView ? "w-full" : isExpanded ? "w-64" : "w-20"

  return (
    <motion.aside
      initial={isMobile && !isMobileView ? { x: -300 } : { x: 0 }}
      animate={isMobile && !isMobileView ? { x: isOpen ? 0 : -300 } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${
        isMobile && !isMobileView
          ? "fixed top-16 left-0 z-50 h-[calc(100vh-64px)] border-r border-slate-200 bg-white shadow-lg"
          : "border-r border-slate-200 bg-white"
      } ${sidebarWidth} flex flex-col transition-all duration-300`}
    >
      {/* Header with Logo & Toggle - Desktop Only (hidden in mobile view) */}
      {!isMobile && !isMobileView && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          {/* Logo - Only show when expanded */}
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-900">WeShare</span>
            </motion.div>
          ) : (
            <div className="h-10" />
          )}

          {/* Toggle Button - Always Visible on Same Line */}
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            aria-label="Toggle sidebar"
            type="button"
          >
            {isExpanded ? (
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-600" />
            )}
          </motion.button>
        </div>
      )}

      {/* Navigation Items */}
      <nav
        className={`flex-1 space-y-2 ${isExpanded ? "px-3 py-4" : "flex flex-col items-center px-2 py-4"}`}
      >
        {menuItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Tooltip key={item.id} delayDuration={200}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => handleMenuItemClick(item.id, item.href)}
                  className={`relative flex items-center rounded-lg transition-all duration-200 ${
                    isExpanded
                      ? "w-full justify-start gap-3 px-4 py-3"
                      : "h-12 w-12 justify-center"
                  } ${
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  whileHover={{ x: isExpanded ? 5 : 0 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  {/* Active Left Indicator Bar */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute top-0 bottom-0 left-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/80"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  <div className="flex-shrink-0">{item.icon}</div>

                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-sm font-medium ${
                        active ? "font-semibold text-slate-900" : ""
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.button>
              </TooltipTrigger>
              {!isExpanded && !isMobile && (
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-slate-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className={`flex items-center rounded-lg p-3 transition-all duration-200 ${
                isExpanded ? "w-full justify-start" : "h-14 w-14 justify-center"
              } hover:bg-slate-100`}
              whileHover={{ scale: 1.02 }}
              type="button"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover object-center"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {user?.userName
                      ? user.userName.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                )}
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 flex-1 text-left"
                >
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.userName || "User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    ID: {user?.userId || "N/A"}
                  </p>
                </motion.div>
              )}
            </motion.button>
          </DropdownMenuTrigger>

          {/* Dropdown Menu Content */}
          <DropdownMenuContent
            side="top"
            align={isExpanded ? "end" : "center"}
            className="w-56"
          >
            {/* Header Section */}
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                  {user?.avatar ? (
                    <img
                      src={user?.avatar}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {user?.userName
                        ? user.userName.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.userName || "User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    ID: {user?.userId || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Action Buttons */}
            <div className="space-y-1 px-2 py-1">
              <Button
                onClick={() => {
                  navigate("/profile")
                  if (isMobile) onMobileClose?.()
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-slate-700 hover:bg-slate-100"
              >
                <User className="h-4 w-4" />
                View Details Profile
              </Button>

              <Button
                onClick={handleLogout}
                disabled={logout.isPending}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-slate-700 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                {logout.isPending ? "Logging out..." : "Logout"}
              </Button>

              <Button
                onClick={handleLogoutAll}
                disabled={logoutAllDevices.isPending}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-red-700 hover:bg-red-50"
              >
                <ShieldAlert className="h-4 w-4" />
                {logoutAllDevices.isPending
                  ? "Logging out..."
                  : "Logout All Devices"}
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  )
}
