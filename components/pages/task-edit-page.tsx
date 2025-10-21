// File: E:/projects/sorties/task-management/task-manager-app/components/pages/task-edit-page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UpdateTaskSchema, type UpdateTaskInput, type Task } from "../../lib/schemas"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { useToast } from "../ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import Link from "next/link"
import { Skeleton } from "../ui/skeleton"
import { useUpdateTask } from "@/hooks/use-tasks";
import { createClientLogger } from "@/lib/logger";

const logger = createClientLogger("TaskEditPage");

interface TaskEditPageContentProps {
    taskId: string
}

export function TaskEditPageContent({ taskId }: TaskEditPageContentProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [task, setTask] = useState<Task | null>(null)
    const [loading, setLoading] = useState(true)
    const { mutate: updateTask, isPending } = useUpdateTask();

    const form = useForm<UpdateTaskInput>({
        resolver: zodResolver(UpdateTaskSchema),
    })

    const fetchTask = useCallback(async () => {
        setLoading(true);
        try {
            logger.info(`Fetching task with ID: ${taskId}`);
            const response = await fetch(`/api/tasks/${taskId}`);
            if (!response.ok) throw new Error("Task not found");
            const data = await response.json();
            const parsedTask = {
                ...data,
                startDate: new Date(data.startDate),
                dueDate: new Date(data.dueDate),
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt),
            };
            setTask(parsedTask);
            form.reset({
                ...parsedTask,
                description: parsedTask.description ?? "",
            });
            logger.info("Successfully fetched and parsed task.", { task: parsedTask });
        } catch (error) {
            logger.error("Failed to load task.", { error });
            toast({ variant: "destructive", title: "Error", description: "Failed to load task." });
            setTask(null);
        } finally {
            setLoading(false);
        }
    }, [taskId, form, toast]);

    useEffect(() => {
        fetchTask();
    }, [fetchTask]);

    const onSubmit = async (data: UpdateTaskInput) => {
        logger.info("Form submitted. Calling updateTask mutation.", { taskId, data });
        updateTask(
            { id: taskId, ...data },
            {
                onSuccess: () => {
                    logger.info("updateTask mutation successful. Navigating to /tasks.");
                    toast({ title: "Success", description: "Task updated successfully." });
                    router.push("/tasks");
                },
                onError: (error) => {
                    logger.error("updateTask mutation failed in component.", { error });
                    toast({
                        variant: "destructive",
                        title: "Update Failed",
                        description: "Could not save your changes. Please try again.",
                    });
                },
            }
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="p-4 md:p-6 text-center">
                <h1 className="text-2xl font-bold">Task not found</h1>
                <p className="text-muted-foreground">The task you are looking for does not exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/tasks">Go back to tasks</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Edit Task</CardTitle>
                    <CardDescription>Update the details for your task.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Task title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Task description" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="todo">To Do</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="work">Work</SelectItem>
                                                <SelectItem value="personal">Personal</SelectItem>
                                                <SelectItem value="shopping">Shopping</SelectItem>
                                                <SelectItem value="health">Health</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                                                onChange={(e) => e.target.value ? field.onChange(new Date(e.target.value + 'T00:00:00.000Z')) : field.onChange(undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                                                onChange={(e) => e.target.value ? field.onChange(new Date(e.target.value + 'T00:00:00.000Z')) : field.onChange(undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" className="flex-1" disabled={isPending}>
                                    {isPending ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
