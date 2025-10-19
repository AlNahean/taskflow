"use client"

import type { Task } from "@/lib/schemas"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "@/components/dashboard/task-card"

interface TasksForDateProps {
  date: Date
  tasks: Task[]
  onTaskUpdate: () => void;
}

export function TasksForDate({ date, tasks, onTaskUpdate }: TasksForDateProps) {
  const tasksForDate = tasks.filter((task) => format(new Date(task.dueDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks for {format(date, "EEEE, MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        {tasksForDate.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No tasks for this date</p>
        ) : (
          <div className="space-y-3">
            {tasksForDate.map((task) => (
              <TaskCard key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
