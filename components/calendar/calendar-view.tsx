// File: E:/projects/sorties/task-management/task-manager-app/components/calendar/calendar-view.tsx
"use client"

import { useMemo, useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/schemas"

interface CalendarViewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  tasks: Task[]
}

export function CalendarView({ selectedDate, onDateSelect, tasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const dateKey = format(new Date(task.dueDate), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey]++;
      return acc;
    }, {} as Record<string, number>);
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd")
          const taskCount = tasksByDate[dateKey] || 0
          const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
          const isCurrentDay = isToday(day)

          return (
            <button
              key={format(day, "yyyy-MM-dd")}
              onClick={() => onDateSelect(day)}
              className={cn(
                "relative aspect-square rounded-lg p-1 text-sm font-medium transition-colors flex flex-col items-center justify-center",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isCurrentDay
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "bg-muted hover:bg-muted/80",
                !isSameMonth(day, currentMonth) && "opacity-50",
              )}
            >
              <span>{format(day, "d")}</span>
              {taskCount > 0 && (
                <div className={cn(
                  "absolute bottom-1 right-1 h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-bold",
                  isSelected ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                )}>
                  {taskCount}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}