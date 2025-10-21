import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/ui/use-toast";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  SubTask,
} from "../lib/schemas";
import { createClientLogger } from "../lib/logger";
import { v4 as uuidv4 } from "uuid"; // Add this import

const logger = createClientLogger("useTasks");

// Helper to parse date strings from the API into Date objects
const parseTaskDates = (task: any): Task => ({
  ...task,
  startDate: new Date(task.startDate),
  dueDate: new Date(task.dueDate),
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
  subtasks: task.subtasks?.map((st: any) => ({
    ...st,
    createdAt: new Date(st.createdAt),
    updatedAt: new Date(st.updatedAt),
  })),
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
    const errorBody = await response.json().catch(() => ({}));
    logger.error("API error response body", { error: errorBody });
    throw new Error("Failed to create task");
  }
  return response.json();
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      logger.info("Task creation successful", { data });
      toast({ title: "Success", description: "Task created successfully." });
      return queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      logger.error("Task creation mutation failed", { error });
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
  logger.info(`[mutationFn] Attempting to PATCH /api/tasks/${id}`, { data });
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    logger.error("[mutationFn] API error on task update", {
      status: response.status,
      body: errorBody,
    });
    throw new Error(`Failed to update task: ${response.statusText}`);
  }
  const responseData = await response.json();
  logger.info("[mutationFn] Successfully updated task via API.", {
    responseData,
  });
  return responseData;
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    Task,
    Error,
    { id: string } & UpdateTaskInput,
    { previousTasks: Task[] | undefined }
  >({
    mutationFn: updateTask,
    onMutate: async (updatedTaskData) => {
      logger.info("[onMutate] Optimistically updating task.", {
        updatedTaskData,
      });
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((task) => {
          if (task.id === updatedTaskData.id) {
            const currentSubtasks = task.subtasks || [];
            const incomingSubtasks = updatedTaskData.subtasks || [];

            const newSubtasksMap = new Map<string, SubTask>();

            // Process existing and updated subtasks
            incomingSubtasks.forEach((incomingSt) => {
              if (incomingSt.id) {
                // Existing subtask being updated
                const existingSt = currentSubtasks.find(
                  (st) => st.id === incomingSt.id
                );
                if (existingSt) {
                  newSubtasksMap.set(incomingSt.id, {
                    ...existingSt,
                    ...incomingSt,
                  });
                } else {
                  // This case means an existing subtask ID was provided but not found in current task.
                  // For optimistic update, we'll create a placeholder.
                  newSubtasksMap.set(incomingSt.id, {
                    id: incomingSt.id,
                    taskId: task.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    text: incomingSt.text,
                    completed: incomingSt.completed,
                  });
                }
              } else {
                // New subtask (no ID yet), assign a temporary one for optimistic update
                const tempId = uuidv4();
                newSubtasksMap.set(tempId, {
                  id: tempId,
                  taskId: task.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  text: incomingSt.text,
                  completed: incomingSt.completed,
                });
              }
            });

            // The final list of subtasks for the optimistic update
            const finalSubtasks = Array.from(newSubtasksMap.values());

            return {
              ...task,
              ...updatedTaskData,
              subtasks: finalSubtasks,
            };
          }
          return task;
        })
      );
      return { previousTasks };
    },
    onSuccess: (data, variables) => {
      logger.info("[onSuccess] Hook success handler fired.", {
        data,
        variables,
      });
      toast({ title: "Success", description: "Task updated." });
    },
    onError: (err, variables, context) => {
      logger.error("[onError] Hook error handler fired.", {
        error: err,
        variables,
      });
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task.",
      });
    },
    onSettled: (data, error, variables) => {
      logger.info(
        "[onSettled] Hook settled handler fired. Invalidating queries.",
        { data, error, variables }
      );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
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

// Update a single subtask
const updateSubtask = async ({
  id,
  completed,
}: {
  id: string;
  completed: boolean;
}): Promise<SubTask> => {
  const response = await fetch(`/api/subtasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) {
    throw new Error("Failed to update subtask");
  }
  return response.json();
};

export const useUpdateSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubtask,
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((task) => ({
          ...task,
          subtasks: task.subtasks?.map((st) =>
            st.id === id ? { ...st, completed } : st
          ),
        }))
      );
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
