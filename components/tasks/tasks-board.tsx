// File: E:/projects/sorties/task-management/task-manager-app/components/tasks/tasks-board.tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import type { Task, TaskStatus, Filters } from "@/lib/schemas"
import * as Kanban from "@/components/ui/kanban"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface TasksBoardProps {
    tasks: Task[]
    filters: Partial<Filters>
}

const COLUMN_TITLES: Record<TaskStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
    overdue: "Overdue",
};

export function TasksBoard({ tasks: initialTasks, filters }: TasksBoardProps) {
    const { toast } = useToast()

    const [columns, setColumns] = React.useState<Record<string, Task[]>>(() => {
        const initial: Record<string, Task[]> = {
            todo: [],
            in_progress: [],
            completed: [],
            overdue: [],
        };
        (initialTasks || []).forEach(task => {
            if (initial[task.status]) {
                initial[task.status].push(task);
            }
        });
        return initial;
    });

    React.useEffect(() => {
        const filteredTasks = (initialTasks || []).filter((task) => {
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

        const newColumns: Record<string, Task[]> = {
            todo: [],
            in_progress: [],
            completed: [],
            overdue: [],
        };
        filteredTasks.forEach(task => {
            if (newColumns[task.status]) {
                newColumns[task.status].push(task);
            }
        });
        setColumns(newColumns);

    }, [initialTasks, filters]);


    const handleValueChange = async (newColumns: Record<string, Task[]>) => {
        const oldColumns = columns;
        // Optimistic update
        setColumns(newColumns);

        let movedTaskId: string | null = null;
        let newStatus: TaskStatus | null = null;
        let originalStatus: TaskStatus | null = null;

        for (const status in oldColumns) {
            for (const task of oldColumns[status as TaskStatus]) {
                const stillInSameColumn = newColumns[status]?.some(t => t.id === task.id);
                if (!stillInSameColumn) {
                    movedTaskId = task.id;
                    originalStatus = status as TaskStatus;
                    break;
                }
            }
            if (movedTaskId) break;
        }

        if (movedTaskId && originalStatus) {
            for (const status in newColumns) {
                if (status !== originalStatus) {
                    const found = newColumns[status].some(t => t.id === movedTaskId);
                    if (found) {
                        newStatus = status as TaskStatus;
                        break;
                    }
                }
            }
        }

        if (movedTaskId && newStatus) {
            try {
                const response = await fetch(`/api/tasks/${movedTaskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                });
                if (!response.ok) throw new Error("Failed to update task status");

                toast({ title: "Success", description: `Task moved to ${COLUMN_TITLES[newStatus]}.` })
            } catch (error) {
                setColumns(oldColumns); // Revert on failure
                toast({ variant: "destructive", title: "Error", description: "Failed to update task status." })
            }
        }
    }


    return (
        <div className="overflow-x-auto">
            <Kanban.Root
                value={columns}
                onValueChange={handleValueChange}
                getItemValue={(item) => item.id}
            >
                <Kanban.Board className="grid grid-cols-4 gap-4 auto-rows-fr">
                    {Object.entries(columns).map(([columnValue, tasks]) => (
                        <Kanban.Column key={columnValue} value={columnValue} className="min-h-96">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                        {COLUMN_TITLES[columnValue as TaskStatus]}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="pointer-events-none rounded-sm"
                                    >
                                        {tasks.length}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 p-0.5 mt-2">
                                {tasks.map((task) => (
                                    <Kanban.Item key={task.id} value={task.id} asHandle asChild>
                                        <Link href={`/tasks/${task.id}`}>
                                            <div className="rounded-md border bg-card p-3 shadow-xs">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="line-clamp-2 font-medium text-sm">
                                                            {task.title}
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                task.priority === "high"
                                                                    ? "destructive"
                                                                    : task.priority === "medium"
                                                                        ? "default"
                                                                        : "secondary"
                                                            }
                                                            className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize"
                                                        >
                                                            {task.priority}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                                                        <Badge variant="outline" className="text-xs">{task.category}</Badge>
                                                        <time className="text-[10px] tabular-nums">
                                                            {format(new Date(task.dueDate), "MMM d")}
                                                        </time>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Kanban.Item>
                                ))}
                            </div>
                        </Kanban.Column>
                    ))}
                </Kanban.Board>
                <Kanban.Overlay>
                    <div className="size-full rounded-md bg-primary/10" />
                </Kanban.Overlay>
            </Kanban.Root>
        </div>
    );
}
