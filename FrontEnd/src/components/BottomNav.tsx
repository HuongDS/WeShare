import { useLocation, useNavigate } from "react-router-dom"
import { Home, Users, Plus, User } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  onQuickAdd?: () => void
}

export default function BottomNav({ onQuickAdd }: BottomNavProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    {
      id: "dashboard",
      label: "Trang chủ",
      icon: Home,
      path: "/dashboard",
    },
    {
      id: "groups",
      label: "Nhóm",
      icon: Users,
      path: "/groups",
    },
    {
      id: "quick-add",
      label: "Tạo mới",
      isAction: true,
      icon: Plus,
    },
    {
      id: "profile",
      label: "Hồ sơ",
      icon: User,
      path: "/profile",
    },
  ]

  const isActive = (path?: string) => {
    if (!path) return false
    if (path === "/groups") return location.pathname.startsWith("/groups")
    return location.pathname === path
  }

  const handleAction = () => {
    if (onQuickAdd) {
      onQuickAdd()
    } else {
      navigate("/groups")
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 pb-safe backdrop-blur-md lg:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={handleAction}
                aria-label="Tạo khoản chi hoặc nhóm mới"
                className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-lime-voltage text-forest-ink shadow-lg shadow-lime-voltage/30 transition-transform focus:outline-none"
              >
                <item.icon className="h-6 w-6 stroke-[2.5]" />
              </motion.button>
            )
          }

          const active = isActive(item.path)
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => item.path && navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-4 text-xs font-medium transition-colors focus:outline-none",
                active
                  ? "text-forest-ink dark:text-lime-voltage font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1 h-1 w-6 rounded-full bg-lime-voltage"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110"
                )}
              />
              <span className="mt-1 text-[11px] tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
