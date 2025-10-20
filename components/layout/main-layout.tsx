// File: E:/projects/sorties/task-management/task-manager-app/components/layout/main-layout.tsx
"use client"

import { type ReactNode, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useApp } from "@/contexts/app-provider"

export function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()
  const { openTaskModal } = useApp()
  const pathname = usePathname()

  const hideAddButtonOnPaths = ['/chat'];
  const shouldHideAddButton = hideAddButtonOnPaths.includes(pathname);

  // This check is now primarily for client-side logic, not initial layout
  const showDesktopSidebar = !isMobile;

  return (
    <div className="flex h-screen bg-background">
      {/* --- THIS IS THE FIX --- */}
      {/* This container is now hidden on mobile by default using Tailwind classes */}
      <div className="hidden md:block">
        {showDesktopSidebar && <Sidebar />}
      </div>

      {/* Mobile Sidebar Overlay (logic remains the same) */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar (logic remains the same) */}
      {isMobile && (
        <div
          className={`fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>

        {!shouldHideAddButton && (
          <Button
            onClick={() => openTaskModal()}
            className="absolute bottom-24 right-6 h-14 w-14 rounded-full shadow-lg md:bottom-8 md:right-8"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add New Task</span>
          </Button>
        )}

        {isMobile && <BottomNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
      </div>
    </div>
  )
}