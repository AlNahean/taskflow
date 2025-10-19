import { DashboardPageContent } from "../components/pages/dashboard-page"
import prisma from "../lib/prisma"
import { Task } from "../lib/schemas"

// Helper to serialize task dates for passing from Server to Client Component
const serializeTasks = (tasks: any[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    startDate: task.startDate.toISOString(),
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));
};

export default async function Home() {
  const tasks = await prisma.task.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return <DashboardPageContent initialTasks={serializeTasks(tasks)} />
}
