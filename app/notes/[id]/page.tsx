import { NoteDetailPageContent } from "@/components/pages/note-detail-page";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SuggestedTask, Task } from "@/lib/schemas";
import { Note as PrismaNote } from "@prisma/client"; // Import Prisma's Note type

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Define a type for the Prisma query result to ensure type safety
type SuggestedTaskWithCreatedTask = SuggestedTask & {
    createdTask: Task | null;
};

// Define the type for the note returned by Prisma, including suggested tasks
type NoteWithSuggestedTasks = PrismaNote & {
    suggestedTasks: SuggestedTaskWithCreatedTask[];
};

async function getNote(id: string): Promise<NoteWithSuggestedTasks> {
    const note = await prisma.note.findUnique({
        where: { id },
        include: {
            suggestedTasks: {
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
    return note as NoteWithSuggestedTasks;
}

// Type for a Task with serialized dates
type SerializedTask = Omit<Task, 'startDate' | 'dueDate' | 'createdAt' | 'updatedAt'> & {
    startDate: string | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
};

// Type for the serialized suggested tasks
type SuggestedTaskWithSerializedDates = Omit<SuggestedTaskWithCreatedTask, 'startDate' | 'dueDate' | 'createdAt' | 'updatedAt'> & {
    startDate: string | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    createdTask: SerializedTask | null;
};

// Type for the serialized note to be passed to the client component
type NoteForClient = Omit<PrismaNote, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
    suggestedTasks: SuggestedTaskWithSerializedDates[];
};


export default async function NoteDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const note = await getNote(id);

    // Serialize dates for client component
    const serializedNote: NoteForClient = {
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        suggestedTasks: note.suggestedTasks.map((task) => {
            const { startDate, dueDate, createdAt, updatedAt, ...rest } = task;
            return {
                ...rest,
                startDate: startDate?.toISOString() ?? null,
                dueDate: dueDate?.toISOString() ?? null,
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
                createdTask: task.createdTask ? (() => {
                    const { startDate, dueDate, createdAt, updatedAt, ...createdTaskRest } = task.createdTask;
                    return {
                        ...createdTaskRest,
                        startDate: startDate?.toISOString() ?? null,
                        dueDate: dueDate?.toISOString() ?? null,
                        createdAt: createdAt.toISOString(),
                        updatedAt: updatedAt.toISOString(),
                    };
                })() : null,
            };
        }),
    };

    return <NoteDetailPageContent note={serializedNote} />;
}
