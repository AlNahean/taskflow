import { NoteDetailPageContent } from "@/components/pages/note-detail-page";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;


async function getNote(id: string) {
    const note = await prisma.note.findUnique({
        where: { id },
        include: {
            suggestedTasks: {
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
        suggestedTasks: note.suggestedTasks.map(task => ({
            ...task,
            startDate: task.startDate?.toISOString() ?? null,
            dueDate: task.dueDate?.toISOString() ?? null,
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
        }))
    };
    return serializedNote;
}

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const note = await getNote(id);
    return <NoteDetailPageContent note={note} />;
}
