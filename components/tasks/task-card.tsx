"use client"

import type { Task, TaskStatus } from "@/lib/schemas"
import Link from "next/link"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { MoreVertical, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useToast } from "../ui/use-toast"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onTaskUpdate: () => void
}

const priorityColors: Record<string, string> = {
  low: "text-gray-500 border-gray-200 dark:border-gray-700",
  medium: "text-yellow-500 border-yellow-200 dark:border-yellow-700",
  high: "text-red-500 border-red-200 dark:border-red-700",
}

export function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const { toast } = useToast()

  const updateTaskStatus = async (newStatus: TaskStatus) => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) {
      toast({ title: "Success", description: "Task status updated." })
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
    updateTaskStatus(newStatus)
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-start gap-3 flex-1">
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
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/tasks/${task.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteTask} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
        <Badge variant="outline">{format(new Date(task.dueDate), "MMM d")}</Badge>
        <Badge variant="outline" className={priorityColors[task.priority]}>
          {task.priority}
        </Badge>
        <Badge variant="secondary">{task.category}</Badge>
      </div>
    </Card>
  )
}
