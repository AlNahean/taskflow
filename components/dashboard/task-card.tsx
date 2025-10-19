"use client"

import type { Task, TaskStatus } from "../../lib/schemas"
import Link from "next/link"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { MoreVertical } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useToast } from "../ui/use-toast"

interface TaskCardProps {
  task: Task
  onTaskUpdate: () => void
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const priorityColors: Record<string, string> = {
  low: "text-gray-500",
  medium: "text-yellow-500",
  high: "text-red-500",
}

export function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const { toast } = useToast()

  const updateTask = async (data: Partial<Task>) => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      toast({ title: "Success", description: "Task updated." })
      onTaskUpdate();
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to update task." })
    }
  }

  const deleteTask = async () => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      toast({ title: "Success", description: "Task deleted." })
      onTaskUpdate();
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete task." })
    }
  }

  const handleToggleComplete = () => {
    const newStatus: TaskStatus = task.status === "completed" ? "todo" : "completed"
    updateTask({ status: newStatus })
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Checkbox checked={task.status === "completed"} onCheckedChange={handleToggleComplete} className="mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Link href={`/tasks/${task.id}`}>
                <p
                  className={`font-medium hover:underline ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                >
                  {task.title}
                </p>
                {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={deleteTask}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={statusColors[task.status]}>{task.status.replace('_', '-')}</Badge>
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
