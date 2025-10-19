import { AnalyticsPageContent } from "@/components/pages/analytics-page"
import prisma from "@/lib/prisma"
import { Task } from "@/lib/schemas"

const serializeTasks = (tasks: any[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    startDate: task.startDate.toISOString(),
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));
};

export default async function AnalyticsPage() {
  const tasks = await prisma.task.findMany();
  return <AnalyticsPageContent initialTasks={serializeTasks(tasks)} />
}
