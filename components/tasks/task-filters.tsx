"use client"

import { useState } from "react"
import type { TaskStatus, TaskPriority, TaskCategory, Filters } from "@/lib/schemas"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TaskFiltersProps {
  onFiltersChange: (filters: Partial<Filters>) => void
}

export function TaskFilters({ onFiltersChange }: TaskFiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus[]>([])
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority[]>([])
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory[]>([])

  const handleFilterChange = () => {
    onFiltersChange({
      search: search || undefined,
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      priority: selectedPriority.length > 0 ? selectedPriority : undefined,
      category: selectedCategory.length > 0 ? selectedCategory : undefined,
    })
  }

  const toggleStatus = (status: TaskStatus) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status]
    setSelectedStatus(newStatus)
  }

  const togglePriority = (priority: TaskPriority) => {
    const newPriority = selectedPriority.includes(priority)
      ? selectedPriority.filter((p) => p !== priority)
      : [...selectedPriority, priority]
    setSelectedPriority(newPriority)
  }

  const toggleCategory = (category: TaskCategory) => {
    const newCategory = selectedCategory.includes(category)
      ? selectedCategory.filter((c) => c !== category)
      : [...selectedCategory, category]
    setSelectedCategory(newCategory)
  }

  const handleReset = () => {
    setSearch("")
    setSelectedStatus([])
    setSelectedPriority([])
    setSelectedCategory([])
    onFiltersChange({})
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
            {(["todo", "in-progress", "completed", "overdue"] as TaskStatus[]).map((status) => (
              <Badge
                key={status}
                variant={selectedStatus.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleStatus(status)}
              >
                {status}
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
                onClick={() => togglePriority(priority)}
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
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleFilterChange} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
