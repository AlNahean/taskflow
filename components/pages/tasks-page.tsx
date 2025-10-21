// File: components/pages/tasks-page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TasksTable } from "@/components/tasks/tasks-table";
import { TaskFilters } from "@/components/tasks/task-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, SquareStack } from "lucide-react";
import { TasksBoard } from "@/components/tasks/tasks-board";
import { TasksCardView } from "@/components/tasks/tasks-card-view";

type View = "list" | "board" | "card";
const VIEW_STORAGE_KEY = "task-view-preference";

export function TasksPageContent() {
  const { data: tasks = [], isLoading } = useTasks();
  const [filters, setFilters] = useState({});
  const [view, setView] = useState<View>("list");

  useEffect(() => {
    const savedView = localStorage.getItem(VIEW_STORAGE_KEY) as View | null;
    if (savedView) {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: View | "") => {
    if (newView) {
      setView(newView);
      localStorage.setItem(VIEW_STORAGE_KEY, newView);
    }
  };

  const renderCurrentView = () => {
    switch (view) {
      case "board":
        return <TasksBoard tasks={tasks} filters={filters} />;
      case "card":
        return <TasksCardView tasks={tasks} filters={filters} />;
      case "list":
      default:
        return <TasksTable tasks={tasks} filters={filters} />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage all your tasks</p>
        </div>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={handleViewChange}
        >
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="board" aria-label="Board view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="card" aria-label="Card view">
            <SquareStack className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <TaskFilters onFiltersChange={setFilters} />

      {renderCurrentView()}
    </div>
  );
}
