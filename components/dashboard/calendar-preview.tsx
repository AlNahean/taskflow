"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTaskStore } from "@/lib/store"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"
import { cn } from "@/lib/utils"

export function CalendarPreview() {
  const tasks = useTaskStore((state) => state.getTasks())
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const tasksByDate = tasks.reduce(
    (acc, task) => {
      const dateKey = format(task.dueDate, "yyyy-MM-dd")
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(task)
      return acc
    },
    {} as Record<string, typeof tasks>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{format(now, "MMMM yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayTasks = tasksByDate[dateKey] || []
            const isCurrentDay = isToday(day)

            return (
              <div
                key={dateKey}
                className={cn(
                  "aspect-square rounded-lg p-1 text-center text-xs font-medium transition-colors",
                  isCurrentDay ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                  !isSameMonth(day, now) && "opacity-50",
                )}
              >
                <div>{format(day, "d")}</div>
                {dayTasks.length > 0 && (
                  <div className="text-xs mt-1 text-primary dark:text-blue-400">{dayTasks.length}</div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
