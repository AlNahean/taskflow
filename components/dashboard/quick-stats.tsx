"use client"

import type { Task } from "@/lib/schemas"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface QuickStatsProps {
  tasks: Task[]
}

export function QuickStats({ tasks }: QuickStatsProps) {
  const completed = tasks.filter((t) => t.status === "completed").length
  const inProgress = tasks.filter((t) => t.status === "in-progress").length
  const overdue = tasks.filter((t) => t.status === "overdue").length

  const stats = [
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className={stat.bgColor}>
            <CardContent className="flex items-center gap-4 pt-6">
              <Icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
