"use client"

import { useTasks } from "@/hooks/use-tasks"
import { TodayTasks } from "@/components/dashboard/today-tasks"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { CalendarPreview } from "@/components/dashboard/calendar-preview"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardPage() {
  const { tasks, loading, fetchTasks } = useTasks()

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96 lg:col-span-1" />
        </div>
      </div>
    )
  }

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
          <TodayTasks tasks={tasks} onTaskUpdate={fetchTasks} />
        </div>

        {/* Calendar Preview */}
        <div className="lg:col-span-1">
          <CalendarPreview />
        </div>
      </div>
    </div>
  )
}
