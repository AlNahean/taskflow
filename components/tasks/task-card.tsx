// File: components/tasks/task-card.tsx
"use client";

import type { Task, TaskStatus } from "@/lib/schemas";
import Link from "next/link";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { MoreVertical, Trash2, Star } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { format } from "date-fns";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
}

const priorityColors: Record<string, string> = {
  low: "text-gray-500 border-gray-200 dark:border-gray-700",
  medium: "text-yellow-500 border-yellow-200 dark:border-yellow-700",
  high: "text-red-500 border-red-200 dark:border-red-700",
};

export function TaskCard({ task }: TaskCardProps) {
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const handleToggleComplete = () => {
    const newStatus: TaskStatus =
      task.status === "completed" ? "todo" : "completed";
    updateTask({ id: task.id, status: newStatus });
  };

  const handleToggleStarred = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateTask({ id: task.id, starred: !task.starred });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-start gap-3 flex-1">
        <Checkbox
          checked={task.status === "completed"}
          onCheckedChange={handleToggleComplete}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Link href={`/tasks/${task.id}`}>
                <p
                  className={`font-medium hover:underline ${task.status === "completed"
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                    }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </Link>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleToggleStarred}>
                <Star className={cn("h-4 w-4", task.starred && "fill-current text-yellow-500")} />
              </Button>
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
                  <DropdownMenuItem
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
        <Badge variant="outline">
          {format(new Date(task.dueDate), "MMM d")}
        </Badge>
        <Badge variant="outline" className={priorityColors[task.priority]}>
          {task.priority}
        </Badge>
        <Badge variant="secondary">{task.category}</Badge>
      </div>
    </Card>
  );
}
