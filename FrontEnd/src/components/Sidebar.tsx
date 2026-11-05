import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Users,
  LogOut,
  ShieldAlert,
  Zap,
  User,
  Receipt,
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
import { cn } from "@/lib/utils"

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    id: "groups",
    label: "Groups & Events",
    icon: <Users className="h-5 w-5" />,
    href: "/groups",
  },
  {
    id: "expenses",
    label: "Expenses Hub",
    icon: <Receipt className="h-5 w-5" />,
    href: "/groups",
  },
  {
    id: "profile",
    label: "Settings & Profile",
    icon: <User className="h-5 w-5" />,
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
  const [expandedParents, setExpandedParents] = useState<string[]>([])

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/groups") {
      return location.pathname.startsWith("/groups")
    }
    return location.pathname === href
  }

  const isParentActive = (item: MenuItem) => {
    if (!item.children) return false
    return item.children.some((child) => isActive(child.href))
  }

  const toggleParent = (parentId: string) => {
    setExpandedParents((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    )
  }

  const handleLogout = async () => {
    await logout.mutateAsync({
      refreshToken: localStorage.getItem("refreshToken") || "",
    })
  }

  const handleLogoutAll = async () => {
    await logoutAllDevices.mutateAsync()
  }

  const handleMenuItemClick = (href?: string) => {
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
      transition={{ duration: 0.25 }}
      className={cn(
        isMobile && !isMobileView
          ? "fixed top-16 left-0 z-50 h-[calc(100vh-64px)] border-r border-border bg-card shadow-xl"
          : "border-r border-border bg-card",
        sidebarWidth,
        "flex flex-col transition-all duration-300 select-none"
      )}
    >
      {/* Header with Logo & Toggle */}
      {!isMobile && !isMobileView && (
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {/* Logo */}
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-ink dark:bg-lime-voltage text-lime-voltage dark:text-forest-ink shadow-sm">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-lg text-foreground leading-none">
                  WeShare
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">
                  Smart Splitter
                </span>
              </div>
            </motion.div>
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-ink dark:bg-lime-voltage text-lime-voltage dark:text-forest-ink cursor-pointer mx-auto"
              onClick={() => navigate("/dashboard")}
            >
              <Zap className="h-5 w-5 fill-current" />
            </div>
          )}

          {/* Toggle Button */}
          {isExpanded && (
            <button
              onClick={toggleSidebar}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Collapse sidebar"
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <nav
        className={cn(
          "flex-1 space-y-1.5 py-4",
          isExpanded ? "px-3" : "flex flex-col items-center px-2"
        )}
      >
        {menuItems.map((item) => {
          const active = isActive(item.href)
          const parentActive = isParentActive(item)
          const isParentExpanded = expandedParents.includes(item.id)
          const hasChildren = item.children && item.children.length > 0
          const isItemActive = active || parentActive

          return (
            <div key={item.id} className="w-full">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleParent(item.id)
                      } else {
                        handleMenuItemClick(item.href)
                      }
                    }}
                    className={cn(
                      "relative flex items-center transition-all duration-200 outline-none",
                      isExpanded
                        ? "w-full justify-start gap-3.5 px-4 py-2.5 rounded-full"
                        : "h-11 w-11 justify-center rounded-full mx-auto",
                      isItemActive
                        ? "bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink font-semibold shadow-sm"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                    type="button"
                  >
                    <div className="flex-shrink-0">{item.icon}</div>

                    {isExpanded && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate text-sm font-medium tracking-tight">
                          {item.label}
                        </span>

                        {hasChildren && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform text-muted-foreground",
                              isParentExpanded && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                {!isExpanded && !isMobile && (
                  <TooltipContent side="right" sideOffset={12}>
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )
        })}

        {/* Expand toggle when collapsed */}
        {!isExpanded && !isMobile && !isMobileView && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Expand sidebar"
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center rounded-full p-2 transition-all duration-200 hover:bg-muted outline-none",
                isExpanded ? "w-full justify-start" : "h-11 w-11 justify-center mx-auto"
              )}
              type="button"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-forest-ink text-lime-voltage dark:bg-lime-voltage dark:text-forest-ink font-bold text-xs ring-2 ring-border">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>
                    {user?.userName
                      ? user.userName.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                )}
              </div>

              {isExpanded && (
                <div className="ml-3 flex-1 text-left min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.userName || "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    ID: {user?.userId || "N/A"}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align={isExpanded ? "start" : "center"}
            className="w-56 rounded-2xl p-2 shadow-xl"
          >
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-bold text-foreground">
                {user?.userName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                ID: {user?.userId || "N/A"}
              </p>
            </div>

            <DropdownMenuSeparator />

            <div className="space-y-1">
              <Button
                onClick={() => {
                  navigate("/profile")
                  if (isMobile) onMobileClose?.()
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 rounded-xl text-xs"
              >
                <User className="h-4 w-4" />
                Profile Settings
              </Button>

              <Button
                onClick={handleLogout}
                disabled={logout.isPending}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 rounded-xl text-xs"
              >
                <LogOut className="h-4 w-4" />
                {logout.isPending ? "Logging out..." : "Logout"}
              </Button>

              <Button
                onClick={handleLogoutAll}
                disabled={logoutAllDevices.isPending}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 rounded-xl text-xs text-destructive hover:bg-destructive/10"
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
