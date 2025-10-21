// File: components/pages/analytics-page.tsx
"use client";

import { useTasks } from "@/hooks/use-tasks";
import { CompletionChart } from "@/components/analytics/completion-chart";
import { CategoryChart } from "@/components/analytics/category-chart";
import { StatsCards } from "@/components/analytics/stats-cards";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsPageContent() {
  const { data: tasks = [], isLoading } = useTasks();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-52 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track your task productivity
        </p>
      </div>

      <StatsCards tasks={tasks} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CompletionChart tasks={tasks} />
        <CategoryChart tasks={tasks} />
      </div>
    </div>
  );
}
