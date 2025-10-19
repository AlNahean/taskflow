"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "../lib/schemas";
import { useToast } from "../components/ui/use-toast";

// Helper to parse date strings from the API into Date objects
const parseTaskDates = (task: any): Task => ({
  ...task,
  startDate: new Date(task.startDate),
  dueDate: new Date(task.dueDate),
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
});

export function useTasks(initialTasks?: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [loading, setLoading] = useState(!initialTasks);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    // No need to set loading to true if we already have initial tasks
    if (!initialTasks) {
      setLoading(true);
    }
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data.map(parseTaskDates));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load tasks.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, initialTasks]);

  useEffect(() => {
    if (!initialTasks) {
      fetchTasks();
    }
  }, [fetchTasks, initialTasks]);

  return { tasks, loading, fetchTasks };
}
