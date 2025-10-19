import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/lib/schemas";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    // Intentionally not setting loading to true here to avoid flicker on re-fetches
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      // JSON response will have date strings, convert them to Date objects
      const tasksWithDates = data.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      setTasks(tasksWithDates);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, fetchTasks };
}
