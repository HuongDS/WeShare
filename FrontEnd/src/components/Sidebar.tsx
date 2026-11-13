import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronDown,
  Home,
  Users,
  LogOut,
  ShieldAlert,
  Zap,
  User,
} from "lucide-react"
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
    label: "Bảng điều khiển",
    icon: <Home className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    id: "groups",
    label: "Nhóm & Sự kiện",
    icon: <Users className="h-5 w-5" />,
    href: "/groups",
  },
  {
    id: "profile",
    label: "Hồ sơ & Cài đặt",
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
      {(!isMobile || isMobileView) && (
        <div className="flex h-20 items-center justify-between border-b border-border px-4 pt-1">
          {/* Logo */}
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                navigate("/dashboard")
                if (isMobile) onMobileClose?.()
              }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-voltage text-forest-ink shadow-xs">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tight text-lg text-foreground leading-none">
                  WeShare
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">
                  Chia sẻ chi tiêu
                </span>
              </div>
            </motion.div>
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-voltage text-forest-ink cursor-pointer mx-auto shadow-xs"
              onClick={() => {
                navigate("/dashboard")
                if (isMobile) onMobileClose?.()
              }}
            >
              <Zap className="h-5 w-5 fill-current" />
            </div>
          )}

          {/* Toggle Button */}
          {!isMobileView && isExpanded && (
            <button
              onClick={toggleSidebar}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Thu gọn thanh bên"
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
          "flex-1 space-y-2 py-5",
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
                        ? "bg-lime-voltage text-forest-ink font-bold shadow-xs dark:bg-lime-voltage dark:text-forest-ink"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground font-medium"
                    )}
                    type="button"
                  >
                    <div className="flex-shrink-0">{item.icon}</div>

                    {isExpanded && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate text-sm tracking-tight">
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
                {!isExpanded && !isMobileView && (
                  <TooltipContent side="right">
                    <p className="font-medium text-xs">{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Sub-menu items (if any) */}
              {hasChildren && isParentExpanded && isExpanded && (
                <div className="mt-1 space-y-1 pl-11 pr-2">
                  {item.children?.map((child) => {
                    const childActive = isActive(child.href)
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleMenuItemClick(child.href)}
                        className={cn(
                          "w-full text-left py-1.5 px-3 rounded-full text-xs transition-colors",
                          childActive
                            ? "bg-muted font-bold text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                        type="button"
                      >
                        {child.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer Profile Section */}
      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted text-left outline-none",
                !isExpanded && "justify-center p-1.5"
              )}
              type="button"
            >
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.userName || "User"}`
                  }
                  alt={user?.userName || "User avatar"}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-lime-voltage ring-2 ring-card" />
              </div>

              {isExpanded && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-bold text-foreground">
                    {user?.userName || "Người dùng"}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    ID: {user?.userId || ""}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobileView ? "top" : "right"}
            align="end"
            className="w-56 rounded-2xl p-1.5 shadow-xl border-border bg-card"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-foreground truncate">
                {user?.userName || "Người dùng"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <DropdownMenuSeparator className="my-1" />

            <button
              onClick={() => navigate("/profile")}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Hồ sơ & Tài khoản
            </button>

            <DropdownMenuSeparator className="my-1" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-alarm-red hover:bg-alarm-red/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>

            <button
              onClick={handleLogoutAll}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-alarm-red hover:bg-alarm-red/10 transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              Đăng xuất tất cả thiết bị
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  )
}
