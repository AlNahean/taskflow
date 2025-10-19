"use client"

import type { Task, TaskStatus } from "@/lib/schemas"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTaskStore } from "@/lib/store"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TaskCardProps {
  task: Task
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const priorityColors: Record<string, string> = {
  low: "text-gray-500",
  medium: "text-yellow-500",
  high: "text-red-500",
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useTaskStore((state) => state.updateTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)

  const handleToggleComplete = () => {
    const newStatus: TaskStatus = task.status === "completed" ? "todo" : "completed"
    updateTask(task.id, { status: newStatus })
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Checkbox checked={task.status === "completed"} onCheckedChange={handleToggleComplete} className="mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={`font-medium ${
                  task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {task.title}
              </p>
              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => deleteTask(task.id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={statusColors[task.status]}>{task.status}</Badge>
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            <Badge variant="outline">{task.category}</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
