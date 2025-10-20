"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, ListTodo, Home, Menu, Notebook, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  onMenuClick: () => void
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Today", icon: Home },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    { href: "/notes", label: "Notes", icon: Notebook },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === "/notes" && pathname.startsWith("/notes/"))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={onMenuClick}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </div>
    </nav>
  )
}
