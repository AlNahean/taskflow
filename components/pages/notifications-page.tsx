"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent } from "../../components/ui/card"
import { CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react"

interface TaskStats {
    completed: number
    in_progress: number
    overdue: number
    total: number
}

export function NotificationsPageContent() {
    const [stats, setStats] = useState<TaskStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            try {
                const response = await fetch("/api/tasks/stats")
                if (!response.ok) throw new Error("Failed to fetch stats")
                const data = await response.json()
                setStats(data)
            } catch (error) {
                console.error("Failed to load task stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading || !stats) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-4 w-52 mt-2" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
            </div>
        )
    }

    const statsCards = [
        {
            label: "Total Tasks",
            value: stats.total,
            icon: ListTodo,
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            label: "In Progress",
            value: stats.in_progress,
            icon: Clock,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50 dark:bg-yellow-950",
        },
        {
            label: "Overdue",
            value: stats.overdue,
            icon: AlertCircle,
            color: "text-red-500",
            bgColor: "bg-red-50 dark:bg-red-950",
        },
    ]

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                <p className="text-sm text-muted-foreground">An overview of your task statuses.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.label} className={stat.bgColor}>
                            <CardContent className="flex items-center gap-4 pt-6">
                                <Icon className={`h-8 w-8 ${stat.color}`} />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold">{String(stat.value)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
