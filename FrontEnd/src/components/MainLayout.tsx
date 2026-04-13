import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
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
    <div className="flex h-screen w-full bg-slate-50">
      {/* Left: Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <Sidebar isOpen={false} onToggle={() => {}} isMobile={false} />
      )}

      {/* Right: Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top: Sticky Floating Header */}
        <Header onMobileMenuOpen={() => setSidebarOpen(true)} />

        {/* Bottom: Main Content - Scrollable with proper padding */}
        <main className="flex-1 overflow-auto bg-slate-50 px-4 py-6 md:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="flex w-64 flex-col p-0"
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
