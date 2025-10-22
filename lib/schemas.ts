// File: lib/schemas.ts
import { z } from "zod";

// --- SubTask Schemas ---
export const SubTaskSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Sub-task text cannot be empty"),
  completed: z.boolean(),
  taskId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SubTask = z.infer<typeof SubTaskSchema>;

const CreateSubTaskSchema = z.object({
  text: z.string().min(1, "Sub-task text cannot be empty"),
  completed: z.boolean().default(false),
});

const UpdateSubTaskSchema = z.object({
  id: z.string().optional(), // Will be present for existing sub-tasks
  text: z.string().optional(),
  completed: z.boolean(),
});

// Task Status
export const TaskStatus = z.enum([
  "todo",
  "in_progress",
  "completed",
  "overdue",
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

// Task Priority
export const TaskPriority = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPriority>;

// Task Category
export const TaskCategory = z.enum([
  "work",
  "personal",
  "shopping",
  "health",
  "other",
]);
export type TaskCategory = z.infer<typeof TaskCategory>;

// Task Schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).nullable(),
  status: TaskStatus,
  priority: TaskPriority,
  category: TaskCategory,
  startDate: z.date(),
  dueDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  starred: z.boolean(),
  suggestedTaskId: z.string().nullable().optional(),
  subtasks: z.array(SubTaskSchema).optional(), // Add subtasks relation
});
export type Task = z.infer<typeof TaskSchema>;

// Create Task Input
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  status: TaskStatus,
  priority: TaskPriority,
  category: TaskCategory,
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
  starred: z.boolean().optional(),
  suggestedTaskId: z.string().nullable().optional(),
  subtasks: z.array(CreateSubTaskSchema).optional(), // Add subtasks for creation
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// Update Task Input
export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  subtasks: z.array(UpdateSubTaskSchema).optional(), // Add subtasks for updates
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Filter Schema
export const FilterSchema = z.object({
  status: z.array(TaskStatus).optional(),
  priority: z.array(TaskPriority).optional(),
  category: z.array(TaskCategory).optional(),
  search: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type Filters = z.infer<typeof FilterSchema>;

// Suggested Task Schema
export const SuggestedTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatus,
  priority: TaskPriority,
  category: TaskCategory,
  startDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  isAdded: z.boolean(),
  noteId: z.string(),
  createdAt: z.date(), // Add createdAt
  updatedAt: z.date(), // Add updatedAt
  createdTask: TaskSchema.nullable().optional(), // Add createdTask relation
});
export type SuggestedTask = z.infer<typeof SuggestedTaskSchema>;
