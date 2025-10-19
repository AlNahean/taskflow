// File: E:/projects/sorties/task-management/task-manager-app/components/tasks/task-filters.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import type { TaskStatus, TaskPriority, TaskCategory, Filters } from "@/lib/schemas"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TaskFiltersProps {
  onFiltersChange: (filters: Partial<Filters>) => void
}

export function TaskFilters({ onFiltersChange }: TaskFiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus[]>([])
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority[]>([])
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory[]>([])

  const handleFilterChange = useCallback(() => {
    onFiltersChange({
      search: search || undefined,
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      priority: selectedPriority.length > 0 ? selectedPriority : undefined,
      category: selectedCategory.length > 0 ? selectedCategory : undefined,
    })
  }, [search, selectedStatus, selectedPriority, selectedCategory, onFiltersChange])

  useEffect(() => {
    handleFilterChange()
  }, [handleFilterChange])

  const toggleFilter = <T extends string>(
    selected: T[],
    setSelected: React.Dispatch<React.SetStateAction<T[]>>,
    value: T
  ) => {
    const newSelected = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value]
    setSelected(newSelected)
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium">Status</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(["todo", "in_progress", "completed", "overdue"] as TaskStatus[]).map((status) => (
              <Badge
                key={status}
                variant={selectedStatus.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter(selectedStatus, setSelectedStatus, status)}
              >
                {status.replace('_', '-')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-sm font-medium">Priority</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(["low", "medium", "high"] as TaskPriority[]).map((priority) => (
              <Badge
                key={priority}
                variant={selectedPriority.includes(priority) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter(selectedPriority, setSelectedPriority, priority)}
              >
                {priority}
              </Badge>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(["work", "personal", "shopping", "health", "other"] as TaskCategory[]).map((category) => (
              <Badge
                key={category}
                variant={selectedCategory.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter(selectedCategory, setSelectedCategory, category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}