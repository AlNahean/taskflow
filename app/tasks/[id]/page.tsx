import { TaskEditPageContent } from "@/components/pages/task-edit-page"

export default function TaskEditPage({ params }: { params: { id: string } }) {
    return <TaskEditPageContent taskId={params.id} />
}
