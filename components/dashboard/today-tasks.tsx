"use client"

import type { Task } from "@/lib/schemas"
import { TaskCard } from "./task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isToday } from "date-fns"

interface TodayTasksProps {
  tasks: Task[]
  onTaskUpdate: () => void;
}

export function TodayTasks({ tasks, onTaskUpdate }: TodayTasksProps) {
  const todayTasks = tasks.filter((task) => isToday(new Date(task.dueDate)))

  if (todayTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No tasks for today. Great job!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayTasks.map((task) => (
          <TaskCard key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
        ))}
      </CardContent>
    </Card>
  )
}
