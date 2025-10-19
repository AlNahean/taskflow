"use client"

import { type ReactNode, useState } from "react"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { useIsMobile } from "@/hooks/use-mobile"

export function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div
          className={`fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && <BottomNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
      </div>
    </div>
  )
}
