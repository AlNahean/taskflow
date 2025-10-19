"use client"

import { useState } from "react"
import { useTaskStore } from "@/lib/store"
import { TasksTable } from "@/components/tasks/tasks-table"
import { TaskFilters } from "@/components/tasks/task-filters"
import { TaskFormModal } from "@/components/tasks/task-form-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function TasksPageContent() {
  const tasks = useTaskStore((state) => state.getTasks())
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({})

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage all your tasks</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <TaskFilters onFiltersChange={setFilters} />
      <TasksTable tasks={tasks} filters={filters} />

      <TaskFormModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
