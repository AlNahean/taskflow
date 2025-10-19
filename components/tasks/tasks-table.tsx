"use client"

import type { Task, Filters } from "@/lib/schemas"
import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "../ui/use-toast"

interface TasksTableProps {
  tasks: Task[]
  filters: Partial<Filters>
  onTaskUpdate: () => void;
}

export function TasksTable({ tasks, filters, onTaskUpdate }: TasksTableProps) {
  const { toast } = useToast()

  const updateTask = async (id: string, data: Partial<Task>) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast({ title: "Success", description: "Task updated." })
      onTaskUpdate();
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to update task." })
    }
  }

  const filteredTasks = useMemo(() => {
    // Since dates from API are strings, they need to be converted to Date objects
    const tasksWithDates = tasks.map(task => ({
      ...task,
      dueDate: new Date(task.dueDate),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));

    return tasksWithDates.filter((task) => {
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
        if (!task.title.toLowerCase().includes(searchLower) && !task.description?.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      return true
    })
  }, [tasks, filters])

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => {
                          updateTask(task.id, {
                            status: task.status === "completed" ? "todo" : "completed"
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.status.replace('_', '-')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.category}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(task.dueDate), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
