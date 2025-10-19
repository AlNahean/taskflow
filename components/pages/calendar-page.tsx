"use client"

import { useState } from "react"
import { useTaskStore } from "@/lib/store"
import { CalendarView } from "@/components/calendar/calendar-view"
import { TasksForDate } from "@/components/calendar/tasks-for-date"
import { Card } from "@/components/ui/card"

export function CalendarPageContent() {
  const tasks = useTaskStore((state) => state.getTasks())
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground">View and manage tasks by date</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <CalendarView selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <TasksForDate date={selectedDate} tasks={tasks} />
        </div>
      </div>
    </div>
  )
}
