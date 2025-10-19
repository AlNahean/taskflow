// File: E:/projects/sorties/task-management/task-manager-app/components/pages/tasks-page.tsx
"use client"

import { useState } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { TasksTable } from "@/components/tasks/tasks-table"
import { TaskFilters } from "@/components/tasks/task-filters"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task } from "@/lib/schemas"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LayoutGrid, List } from "lucide-react"
import { TasksBoard } from "@/components/tasks/tasks-board"

interface TasksPageContentProps {
  initialTasks: Task[]
}

type View = "list" | "board"

export function TasksPageContent({ initialTasks }: TasksPageContentProps) {
  const { tasks, loading, fetchTasks } = useTasks(initialTasks)
  const [filters, setFilters] = useState({})
  const [view, setView] = useState<View>("list")

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-9 w-20" />
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
        <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as View)}>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="board" aria-label="Board view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <TaskFilters onFiltersChange={setFilters} />

      {view === "list" ? (
        <TasksTable tasks={tasks} filters={filters} onTaskUpdate={fetchTasks} />
      ) : (
        <TasksBoard tasks={tasks} filters={filters} onTaskUpdate={fetchTasks} />
      )}
    </div>
  )
}