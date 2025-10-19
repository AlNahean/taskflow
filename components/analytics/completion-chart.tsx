"use client"

import type { Task } from "@/lib/schemas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface CompletionChartProps {
  tasks: Task[]
}

const chartConfig = {
  value: {
    label: "Tasks",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

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
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} accessibilityLayer>
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
