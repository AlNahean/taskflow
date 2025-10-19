"use client"

import { useState } from "react"
import { useTasks } from "../../hooks/use-tasks"
import { TodayTasks } from "../../components/dashboard/today-tasks"
import { Skeleton } from "../../components/ui/skeleton"
import { format, getWeek, isToday } from "date-fns"
import { WeekCalendar } from "../dashboard/week-calendar"
import { Clock, CheckCircle2 } from "lucide-react"
import { Task } from "../../lib/schemas"

interface DashboardPageContentProps {
  initialTasks: Task[]
}

export function DashboardPageContent({ initialTasks }: DashboardPageContentProps) {
  const { tasks, loading, fetchTasks } = useTasks(initialTasks)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const today = new Date()

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  const completedToday = tasks.filter(t => t.status === 'completed' && isToday(new Date(t.updatedAt))).length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Today</h1>
        <p className="text-sm text-muted-foreground">
          {format(today, "eeee, MMMM d")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-card p-6 text-card-foreground shadow-lg">
            <img src="/placeholder.jpg" alt="Autumn leaves" className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-10" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{format(today, "eeee")}</p>
                <p className="text-sm font-medium">Week {getWeek(today)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{format(today, "MMM")}</p>
                <p className="text-2xl font-bold">{format(today, "d")}</p>
              </div>
            </div>
            <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              <span>{completedToday}</span>
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              <span>{inProgress}</span>
            </div>
          </div>

          {/* Week Calendar */}
          <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Tasks for selected date */}
        <div>
          <TodayTasks date={selectedDate} tasks={tasks} onTaskUpdate={fetchTasks} />
        </div>
      </div>
    </div>
  )
}
