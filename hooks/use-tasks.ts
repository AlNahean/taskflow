"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "../lib/schemas";
import { useToast } from "../components/ui/use-toast";

// Helper to parse date strings from the API into Date objects
const parseTaskDates = (task: any): Task => ({
  ...task,
  dueDate: new Date(task.dueDate),
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
});

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
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
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, fetchTasks };
}
