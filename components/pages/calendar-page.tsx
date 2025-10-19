// File: E:/projects/sorties/task-management/task-manager-app/components/pages/calendar-page.tsx
"use client"

import { useState } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { CalendarView } from "@/components/calendar/calendar-view"
import { TasksForDate } from "@/components/calendar/tasks-for-date"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CalendarPageContent() {
  const { tasks, loading, fetchTasks } = useTasks()
  const [selectedDate, setSelectedDate] = useState(new Date())

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[25rem] lg:col-span-1" />
          <Skeleton className="h-[25rem] lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground">View and manage tasks by date</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              tasks={tasks}
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <TasksForDate date={selectedDate} tasks={tasks} onTaskUpdate={fetchTasks} />
        </div>
      </div>
    </div>
  )
}