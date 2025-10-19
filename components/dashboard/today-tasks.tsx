"use client"

import type { Task } from "../../lib/schemas"
import Link from "next/link"
import { Card } from "../../components/ui/card"
import { isSameDay, format } from "date-fns"
import { Button } from "../ui/button"
import { MoreVertical, Clock, CheckCircle2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "../../components/ui/empty"

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
        <div className="space-y-3">
          {tasksForDate.map((task) => (
            <Link href={`/tasks/${task.id}`} key={task.id} className="block">
              <Card className="p-4 rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-card-foreground truncate">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.category}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{task.description || "No description"}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      // Dropdown menu logic would go here
                    }}
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <Badge variant="outline">
                    {format(new Date(task.dueDate), "MMM d")}
                  </Badge>
                  {task.status === "in_progress" && (
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
