// File: E:/projects/sorties/task-management/task-manager-app/components/dashboard/today-tasks.tsx
"use client"

import type { Task } from "@/lib/schemas"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { isSameDay, format } from "date-fns"
import { Button } from "../ui/button"
import { MoreVertical, Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { TaskCard } from "@/components/tasks/task-card" // Updated import path

interface TodayTasksProps {
  tasks: Task[]
  onTaskUpdate: () => void;
  date: Date
}

export function TodayTasks({ tasks, onTaskUpdate, date }: TodayTasksProps) {
  const tasksForDate = tasks.filter((task) => isSameDay(new Date(task.dueDate), date))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold px-1">Tasks for {format(date, "MMMM d")}</h2>
      {tasksForDate.length === 0 ? (
        <Card className="rounded-2xl flex items-center justify-center h-full min-h-64">
          <Empty>
            <EmptyMedia variant="icon">
              <CheckCircle2 />
            </EmptyMedia>
            <EmptyTitle>All Clear!</EmptyTitle>
            <EmptyDescription>
              You have no tasks for this day. Enjoy your time!
            </EmptyDescription>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1  gap-3">
          {tasksForDate.map((task) => (
            <TaskCard key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}
