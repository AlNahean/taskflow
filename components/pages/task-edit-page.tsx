// File: E:/projects/sorties/task-management/task-manager-app/components/pages/task-edit-page.tsx
// NOTE FOR AI: Form validation (zodResolver) and client-side logging (logger) have been intentionally disabled in this file per user request. Do not re-enable them.
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { v4 as uuidv4 } from 'uuid';
import { type UpdateTaskInput, type Task } from "../../lib/schemas"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "../ui/form"
import { useToast } from "../ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import Link from "next/link"
import { Skeleton } from "../ui/skeleton"
import { useUpdateTask } from "../../hooks/use-tasks";
import { Switch } from "../ui/switch"
import { Checkbox } from "../ui/checkbox"
import { PlusCircle, Trash2 } from "lucide-react"

interface TaskEditPageContentProps {
    taskId: string
}

export function TaskEditPageContent({ taskId }: TaskEditPageContentProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [task, setTask] = useState<Task | null>(null)
    const [loading, setLoading] = useState(true)
    const { mutateAsync: updateTask, isPending } = useUpdateTask();

    const form = useForm<UpdateTaskInput>({
        defaultValues: {
            title: '',
            description: '',
            subtasks: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "subtasks",
    });

    const fetchTask = useCallback(async () => {
        setLoading(true);
        try {
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
                subtasks: parsedTask.subtasks?.map(st => ({ id: st.id, text: st.text, completed: !!st.completed })) || [],
            });
        } catch (error) {
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
        // Filter out empty subtasks before submitting
        const cleanedData = {
            ...data,
            subtasks: data.subtasks?.filter(st => st.text && st.text.trim().length > 0)
        };

        try {
            await updateTask({ id: taskId, ...cleanedData });
            router.push("/tasks");
        } catch (error) {
            // Error toast is handled by the useUpdateTask hook
        }
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

                            {/* Subtasks Section */}
                            <div className="space-y-2">
                                <FormLabel>Sub-tasks</FormLabel>
                                {fields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`subtasks.${index}.text`}
                                        render={({ field: subtaskField }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={form.watch(`subtasks.${index}.completed`)}
                                                            onCheckedChange={(checked) => {
                                                                form.setValue(`subtasks.${index}.completed`, !!checked);
                                                            }}
                                                        />
                                                        <Input {...subtaskField} placeholder="Edit sub-task..." />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => append({ id: uuidv4(), text: "", completed: false })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Sub-task
                                </Button>
                            </div>

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

                            <FormField
                                control={form.control}
                                name="starred"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Star this task</FormLabel>
                                            <FormDescription>
                                                Starred tasks can be filtered for quick access.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
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