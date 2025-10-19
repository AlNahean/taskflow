import { create } from "zustand"
import type { Task, CreateTaskInput, UpdateTaskInput } from "./schemas"
import { v4 as uuidv4 } from "uuid"

interface TaskStore {
  tasks: Task[]
  addTask: (input: CreateTaskInput) => void
  updateTask: (id: string, input: UpdateTaskInput) => void
  deleteTask: (id: string) => void
  getTasks: () => Task[]
  getTaskById: (id: string) => Task | undefined
}

// Mock data
const mockTasks: Task[] = [
  {
    id: uuidv4(),
    title: "Confirm conference call for Friday",
    description: "Schedule and confirm the Friday meeting",
    status: "in-progress",
    priority: "high",
    category: "work",
    dueDate: new Date(2025, 9, 17),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: "Buy movie tickets for tomorrow",
    description: "Get tickets for the evening show",
    status: "todo",
    priority: "medium",
    category: "personal",
    dueDate: new Date(2025, 9, 18),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    title: "Read article about fasting",
    description: "Research intermittent fasting benefits",
    status: "todo",
    priority: "low",
    category: "health",
    dueDate: new Date(2025, 9, 20),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,

  addTask: (input: CreateTaskInput) => {
    const newTask: Task = {
      ...input,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }))
  },

  updateTask: (id: string, input: UpdateTaskInput) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...input, updatedAt: new Date() } : task)),
    }))
  },

  deleteTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }))
  },

  getTasks: () => get().tasks,

  getTaskById: (id: string) => get().tasks.find((task) => task.id === id),
}))
