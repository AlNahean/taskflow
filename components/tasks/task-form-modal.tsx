// File: components/tasks/task-form-modal.tsx
"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTaskSchema, type CreateTaskInput } from "../../lib/schemas";
import { TaskPriority, TaskCategory } from "../../lib/schemas";
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useToast } from "../ui/use-toast";
import { useEffect } from "react";
import { useModalStore } from "../../stores/use-modal-store";
import { useCreateTask } from "../../hooks/use-tasks";
import { useRouter } from "next/navigation";
import { createClientLogger } from "../../lib/logger";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { PlusCircle, Trash2 } from "lucide-react";

const logger = createClientLogger("TaskFormModal");

export function TaskFormModal() {
  const { toast } = useToast();
  const router = useRouter();
  const { isTaskModalOpen, closeTaskModal, taskModalData } = useModalStore();
  const { mutate: createTask } = useCreateTask();

  // Function to get defaults from localStorage and modal data
  const getDefaults = () => {
    const savedPriority =
      typeof window !== "undefined"
        ? (localStorage.getItem("defaultPriority") as TaskPriority)
        : "medium";
    const savedCategory =
      typeof window !== "undefined"
        ? (localStorage.getItem("defaultCategory") as TaskCategory)
        : "personal";
    return {
      title: taskModalData?.title || "",
      description: taskModalData?.description || null,
      priority: taskModalData?.priority || savedPriority || "medium",
      category: taskModalData?.category || savedCategory || "personal",
      status: taskModalData?.status || "todo",
      starred: taskModalData?.starred || false,
      subtasks: [],
      startDate: taskModalData?.startDate
        ? new Date(taskModalData.startDate)
        : new Date(),
      dueDate: taskModalData?.dueDate
        ? new Date(taskModalData.dueDate)
        : new Date(),
      suggestedTaskId: taskModalData?.suggestedTaskId,
    };
  };

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: getDefaults(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  useEffect(() => {
    if (isTaskModalOpen) {
      form.reset(getDefaults());
    }
  }, [isTaskModalOpen, taskModalData, form]);

  const onSubmit = async (data: CreateTaskInput) => {
    logger.info("Form submission initiated", { data });
    createTask(data, {
      onSuccess: async () => {
        closeTaskModal();
        if (data.suggestedTaskId) {
          try {
            const suggestionResponse = await fetch(
              `/api/suggested-tasks/${data.suggestedTaskId}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAdded: true }),
              }
            );
            if (suggestionResponse.ok) {
              router.refresh(); // Refresh note page to update suggestion state
            }
          } catch (error) {
            console.error("Failed to mark suggestion as added:", error);
          }
        }
      },
    });
  };

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={closeTaskModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {taskModalData ? "Review & Create Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {taskModalData
              ? "Adjust the details suggested by the AI."
              : "Add a new task to your list"}
          </DialogDescription>
        </DialogHeader>

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
                          <Input {...subtaskField} placeholder="New sub-task..." />
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
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => append({ text: "", completed: false })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Sub-task
              </Button>
            </div>


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
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
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
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
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
              <Button type="submit" className="flex-1">
                Create Task
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={closeTaskModal}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
