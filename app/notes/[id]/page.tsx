import { NoteDetailPageContent } from "@/components/pages/note-detail-page";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SuggestedTask, Task } from "@/lib/schemas"; // Import Task and SuggestedTask types

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Define a type for the Prisma query result to ensure type safety
type SuggestedTaskWithCreatedTask = SuggestedTask & {
    createdTask: Task | null;
};

async function getNote(id: string) {
    const note = await prisma.note.findUnique({
        where: { id },
        include: {
            suggestedTasks: {
                // Also include the linked 'createdTask' for each suggestion
                include: {
                    createdTask: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });
    if (!note) {
        notFound();
    }
    // Serialize dates for client component
    const serializedNote = {
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        suggestedTasks: note.suggestedTasks.map((task: SuggestedTaskWithCreatedTask) => ({
            ...task,
            startDate: task.startDate?.toISOString() ?? null,
            dueDate: task.dueDate?.toISOString() ?? null,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
            createdTask: task.createdTask ? {
                ...task.createdTask,
                startDate: task.createdTask.startDate?.toISOString() ?? null,
                dueDate: task.createdTask.dueDate?.toISOString() ?? null,
                createdAt: task.createdTask.createdAt.toISOString(),
                updatedAt: task.createdTask.updatedAt.toISOString(),
            } : null,
        }))
    };
    return serializedNote;
}

export default async function NoteDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // Await params before using its properties
    const { id } = await params;
    const note = await getNote(id);
    return <NoteDetailPageContent note={note} />;
}