"use client"

import type { Task } from "@/lib/schemas"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, Zap } from "lucide-react"

interface StatsCardsProps {
  tasks: Task[]
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const completed = tasks.filter((t) => t.status === "completed").length
  const total = tasks.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const highPriority = tasks.filter((t) => t.priority === "high").length

  const stats = [
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Total Tasks",
      value: total,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "High Priority",
      value: highPriority,
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
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
