import { TaskEditPageContent } from "@/components/pages/task-edit-page"

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default function TaskEditPage({ params }: { params: { id: string } }) {
    return <TaskEditPageContent taskId={params.id} />
}
