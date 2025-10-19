"use client"

import type { Task } from "@/lib/schemas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CompletionChartProps {
  tasks: Task[]
}

export function CompletionChart({ tasks }: CompletionChartProps) {
  const data = [
    {
      name: "Completed",
      value: tasks.filter((t) => t.status === "completed").length,
    },
    {
      name: "In Progress",
      value: tasks.filter((t) => t.status === "in_progress").length,
    },
    {
      name: "Todo",
      value: tasks.filter((t) => t.status === "todo").length,
    },
    {
      name: "Overdue",
      value: tasks.filter((t) => t.status === "overdue").length,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
        <CardDescription>A summary of tasks based on their current status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }} />
            <Bar dataKey="value" fill="hsl(var(--color-primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
