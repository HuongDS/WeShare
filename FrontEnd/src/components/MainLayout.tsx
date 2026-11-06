import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return (
    <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-200">
      {/* Left: Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <Sidebar isOpen={false} onToggle={() => {}} isMobile={false} />
      )}

      {/* Right: Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top: Sticky Floating Header */}
        <Header onMobileMenuOpen={() => setSidebarOpen(true)} />

        {/* Bottom: Main Content - Scrollable with proper padding (extra pb for Mobile BottomNav) */}
        <main className="flex-1 overflow-auto bg-muted/20 px-3 py-4 sm:px-6 lg:py-6 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <BottomNav />}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="flex w-72 flex-col p-0 border-r border-border"
            onInteractOutside={() => {
              setSidebarOpen(false)
            }}
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar
              isOpen={true}
              onToggle={() => {}}
              isMobile={true}
              onMobileClose={() => setSidebarOpen(false)}
              isMobileView={true}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
