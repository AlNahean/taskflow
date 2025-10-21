"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
    PlusCircle,
    Trash2,
    Bell,
    X,
    Calendar as CalendarIcon,
    Repeat,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// --- Zod Schema for the Demo Form ---
const demoTaskSchema = z.object({
    title: z.string().min(1, "Task title is required."),
    description: z.string().optional(),
    dueDate: z.date().optional(),
    subtasks: z.array(
        z.object({
            id: z.string(),
            text: z.string().min(1, "Sub-task cannot be empty."),
            completed: z.boolean(),
        })
    ),
    reminders: z.array(
        z.object({
            id: z.string(),
            time: z.string(), // e.g., '15 minutes before'
        })
    ),
    recurrence: z.string(), // e.g., 'daily', 'weekly'
});

type DemoTaskFormValues = z.infer<typeof demoTaskSchema>;

// --- Self-Contained Demo Page Component ---
export default function TaskDemoPage() {
    const [submittedData, setSubmittedData] = React.useState<
        DemoTaskFormValues | undefined
    >();

    const form = useForm<DemoTaskFormValues>({
        resolver: zodResolver(demoTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            subtasks: [],
            reminders: [],
            recurrence: "none",
        },
    });

    const {
        fields: subtaskFields,
        append: appendSubtask,
        remove: removeSubtask,
    } = useFieldArray({
        control: form.control,
        name: "subtasks",
    });

    const {
        fields: reminderFields,
        append: appendReminder,
        remove: removeReminder,
    } = useFieldArray({
        control: form.control,
        name: "reminders",
    });

    function onSubmit(data: DemoTaskFormValues) {
        console.log("Form Submitted:", data);
        setSubmittedData(data);
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Advanced Task Creation Demo</h1>
                <p className="text-muted-foreground">
                    This is a self-contained UI prototype. No data is saved to the
                    database.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create a New Task</CardTitle>
                    <CardDescription>
                        Explore sub-tasks, reminders, and scheduling options.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* --- Basic Info --- */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Plan company offsite" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* --- Sub-tasks Section --- */}
                            <div className="space-y-4">
                                <FormLabel>Sub-tasks / Checklist</FormLabel>
                                {subtaskFields.map((field, index) => (
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
                                                                form.setValue(
                                                                    `subtasks.${index}.completed`,
                                                                    !!checked
                                                                );
                                                            }}
                                                        />
                                                        <Input {...subtaskField} placeholder="New sub-task..." />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeSubtask(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        appendSubtask({ id: uuidv4(), text: "", completed: false })
                                    }
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Sub-task
                                </Button>
                            </div>

                            {/* --- Reminders Section --- */}
                            <div className="space-y-4">
                                <FormLabel>Reminders</FormLabel>
                                <div className="space-y-2">
                                    {reminderFields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="flex items-center gap-2 rounded-md border p-2"
                                        >
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                            <span className="flex-1 text-sm">{field.time}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeReminder(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" size="sm">
                                            <Bell className="mr-2 h-4 w-4" />
                                            Add Reminder
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-1">
                                        <div className="flex flex-col">
                                            {[
                                                "15 minutes before",
                                                "1 hour before",
                                                "1 day before",
                                                "On day of due date",
                                            ].map((time) => (
                                                <Button
                                                    key={time}
                                                    type="button"
                                                    variant="ghost"
                                                    className="justify-start"
                                                    onClick={() => appendReminder({ id: uuidv4(), time })}
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* --- Recurring Task Section --- */}
                            <FormField
                                control={form.control}
                                name="recurrence"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Repeat</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <Repeat className="h-4 w-4 text-muted-foreground" />
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Does not repeat</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormDescription>
                                            The task will be re-created on this schedule after you
                                            mark it as complete.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">Create Demo Task</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* --- Display Submitted Data --- */}
            {submittedData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Form Output</CardTitle>
                        <CardDescription>
                            This is the data that would be sent to the server.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
                            <code className="text-white">
                                {JSON.stringify(submittedData, null, 2)}
                            </code>
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
