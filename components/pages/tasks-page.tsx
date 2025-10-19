"use client"

import { useState } from "react"
import { useTasks } from "../../hooks/use-tasks"
import { TasksTable } from "../../components/tasks/tasks-table"
import { TaskFilters } from "../../components/tasks/task-filters"
import { Skeleton } from "../../components/ui/skeleton"
import type { Task } from "../../lib/schemas"

interface TasksPageContentProps {
  initialTasks: Task[]
}

export function TasksPageContent({ initialTasks }: TasksPageContentProps) {
  const { tasks, loading, fetchTasks } = useTasks(initialTasks)
  const [filters, setFilters] = useState({})

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage all your tasks</p>
        </div>
      </div>

      <TaskFilters onFiltersChange={setFilters} />
      <TasksTable tasks={tasks} filters={filters} onTaskUpdate={fetchTasks} />
    </div>
  )
}
