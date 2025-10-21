"use client"

import { useMemo } from "react"
import type { Task, Filters } from "@/lib/schemas"
import { TaskCard } from "@/components/tasks/task-card"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { ListX } from "lucide-react"

interface TasksCardViewProps {
    tasks: Task[]
    filters: Partial<Filters>
}

export function TasksCardView({ tasks, filters }: TasksCardViewProps) {
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (filters.status && filters.status.length > 0) {
                if (!filters.status.includes(task.status)) return false
            }
            if (filters.priority && filters.priority.length > 0) {
                if (!filters.priority.includes(task.priority)) return false
            }
            if (filters.category && filters.category.length > 0) {
                if (!filters.category.includes(task.category)) return false
            }
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                if (!task.title.toLowerCase().includes(searchLower) && !(task.description || '').toLowerCase().includes(searchLower)) {
                    return false
                }
            }
            return true
        })
    }, [tasks, filters])

    if (filteredTasks.length === 0) {
        return (
            <div className="py-12">
                <Empty>
                    <EmptyMedia variant="icon">
                        <ListX />
                    </EmptyMedia>
                    <EmptyTitle>No Tasks Found</EmptyTitle>
                    <EmptyDescription>
                        No tasks match your current filters. Try adjusting your search.
                    </EmptyDescription>
                </Empty>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
            ))}
        </div>
    )
}
