"use client"

import { useTaskStore } from "@/lib/store"
import { TodayTasks } from "@/components/dashboard/today-tasks"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { CalendarPreview } from "@/components/dashboard/calendar-preview"

export function DashboardPage() {
  const tasks = useTaskStore((state) => state.getTasks())

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Today</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats tasks={tasks} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <TodayTasks tasks={tasks} />
        </div>

        {/* Calendar Preview */}
        <div className="lg:col-span-1">
          <CalendarPreview />
        </div>
      </div>
    </div>
  )
}
