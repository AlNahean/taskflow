"use client"

import { useTaskStore } from "@/lib/store"
import { CompletionChart } from "@/components/analytics/completion-chart"
import { CategoryChart } from "@/components/analytics/category-chart"
import { StatsCards } from "@/components/analytics/stats-cards"

export function AnalyticsPageContent() {
  const tasks = useTaskStore((state) => state.getTasks())

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your productivity</p>
      </div>

      <StatsCards tasks={tasks} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CompletionChart tasks={tasks} />
        <CategoryChart tasks={tasks} />
      </div>
    </div>
  )
}
