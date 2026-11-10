import { useState, useEffect } from "react"
import { Search, Bell, Menu, Sun, Moon, LogOut, User as UserIcon, Settings, ShieldAlert } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { useAppSelector } from "@/store/hooks"
import { useAuth } from "@/hooks/auth/useAuth"
import GlobalSearchModal from "@/components/GlobalSearchModal"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/expenses": "Expenses",
  "/groups": "Groups",
  "/settlements": "Settlements",
  "/profile": "My Profile",
}

interface HeaderProps {
  onMobileMenuOpen?: () => void
}

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const user = useAppSelector((state) => state.auth.user)
  const { logout, logoutAllDevices } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to toggle Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const pageTitle = location.pathname.startsWith("/groups/")
    ? "Group Hub"
    : routeTitles[location.pathname] || "Dashboard"

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/).filter(Boolean)
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U"
  }

  return (
    <>
      <header className="z-40 h-14 w-full rounded-full border border-border/80 bg-background/80 px-4 sm:px-6 shadow-sm backdrop-blur-md transition-all duration-300">
        <div className="flex h-full items-center justify-between gap-3 sm:gap-4">
          {/* Left Section: Mobile Hamburger + Page Title */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuOpen}
              className="h-9 w-9 rounded-full hover:bg-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </Button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-foreground sm:text-lg tracking-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Center: Global Search Bar Trigger (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="group relative w-full flex items-center justify-between rounded-full border border-border/70 bg-muted/40 py-2 pl-9 pr-3 text-xs sm:text-sm text-muted-foreground hover:border-forest-ink/40 dark:hover:border-lime-voltage/40 hover:bg-muted/70 transition-all duration-200 text-left outline-none"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Search groups, expenses, members...</span>
              <span className="rounded border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-xs">
                ⌘K
              </span>
            </button>
          </div>

          {/* Right Section: Mobile Search + Theme Toggle + Notifications + User Avatar */}
          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="h-9 w-9 rounded-full hover:bg-muted text-foreground md:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Dark / Light Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full hover:bg-muted text-foreground transition-transform active:scale-95"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-lime-voltage transition-all" />
              ) : (
                <Moon className="h-4 w-4 text-forest-ink transition-all" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full hover:bg-muted text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-alarm-red ring-2 ring-background" />
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-2 rounded-full p-0.5 outline-none hover:ring-2 hover:ring-forest-ink/30 dark:hover:ring-lime-voltage/30 transition-all"
                  aria-label="User account"
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border/60">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.userName} />
                    <AvatarFallback className="bg-forest-ink text-lime-voltage text-xs font-bold">
                      {getInitials(user?.userName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl p-1.5 shadow-xl border-border bg-card"
              >
                <DropdownMenuLabel className="font-normal px-2.5 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-foreground">
                      {user?.userName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email || `ID: ${user?.userId || ""}`}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>My Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/groups")}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Manage Groups</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={() => logout.mutate({ refreshToken: localStorage.getItem("refreshToken") || "" })}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-alarm-red hover:bg-alarm-red/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => logoutAllDevices.mutate()}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-alarm-red hover:bg-alarm-red/10 cursor-pointer"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Log out all devices</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
