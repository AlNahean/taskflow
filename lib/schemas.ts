import { z } from "zod"

// Task Status
export const TaskStatus = z.enum(["todo", "in-progress", "completed", "overdue"])
export type TaskStatus = z.infer<typeof TaskStatus>

// Task Priority
export const TaskPriority = z.enum(["low", "medium", "high"])
export type TaskPriority = z.infer<typeof TaskPriority>

// Task Category
export const TaskCategory = z.enum(["work", "personal", "shopping", "health", "other"])
export type TaskCategory = z.infer<typeof TaskCategory>

// Task Schema
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  status: TaskStatus,
  priority: TaskPriority,
  category: TaskCategory,
  dueDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Task = z.infer<typeof TaskSchema>

// Create Task Input
export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>

// Update Task Input
export const UpdateTaskSchema = CreateTaskSchema.partial()

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>

// Filter Schema
export const FilterSchema = z.object({
  status: z.array(TaskStatus).optional(),
  priority: z.array(TaskPriority).optional(),
  category: z.array(TaskCategory).optional(),
  search: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export type Filters = z.infer<typeof FilterSchema>
