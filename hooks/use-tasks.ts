import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/schemas";

// Helper to parse date strings from the API into Date objects
const parseTaskDates = (task: any): Task => ({
  ...task,
  startDate: new Date(task.startDate),
  dueDate: new Date(task.dueDate),
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
});

// Fetch all tasks
const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch("/api/tasks");
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const data = await response.json();
  return data.map(parseTaskDates);
};

export const useTasks = () => {
  return useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
};

// Create a task
const createTask = async (newTask: CreateTaskInput): Promise<Task> => {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  });
  if (!response.ok) {
    throw new Error("Failed to create task");
  }
  return response.json();
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast({ title: "Success", description: "Task created successfully." });
      return queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task.",
      });
    },
  });
};

// Update a task
const updateTask = async ({
  id,
  ...data
}: { id: string } & UpdateTaskInput): Promise<Task> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update task");
  }
  return response.json();
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );
      return { previousTasks };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Task updated." });
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

// Delete a task
const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.filter((task) => task.id !== deletedId)
      );
      return { previousTasks };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Task deleted." });
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
