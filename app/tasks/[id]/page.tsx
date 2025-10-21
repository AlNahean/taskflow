// File: E:/projects/sorties/task-management/task-manager-app/app/tasks/[id]/page.tsx
import { TaskEditPageContent } from "@/components/pages/task-edit-page"

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function TaskEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TaskEditPageContent taskId={id} />
}