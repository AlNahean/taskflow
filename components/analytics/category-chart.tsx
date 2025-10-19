"use client"

import type { Task } from "@/lib/schemas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"

interface CategoryChartProps {
  tasks: Task[]
}

export function CategoryChart({ tasks }: CategoryChartProps) {
  const categoryData = tasks.reduce(
    (acc, task) => {
      const category = task.category.charAt(0).toUpperCase() + task.category.slice(1);
      const existing = acc.find((item) => item.name === category)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: category, value: 1 })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  const chartConfig = categoryData.reduce((config, category, index) => {
    config[category.name.toLowerCase()] = {
      label: category.name,
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return config;
  }, {} as ChartConfig);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>A breakdown of tasks by their category.</CardDescription>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No category data available.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="var(--color-value)">
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
