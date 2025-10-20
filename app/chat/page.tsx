import { ChatPageContent } from "@/components/pages/chat-page";
import prisma from "@/lib/prisma";

// This is a Server Component that fetches all necessary data upfront
export default async function ChatPage() {
    const tasks = await prisma.task.findMany({ orderBy: { dueDate: 'asc' } });
    const notes = await prisma.note.findMany({ orderBy: { updatedAt: 'desc' } });

    // Serialize the data to safely pass it to the client component
    const serializedData = {
        tasks: tasks.map(task => ({
            ...task,
            startDate: task.startDate.toISOString(),
            dueDate: task.dueDate.toISOString(),
            createdAt: task.createdAt.toISOString(),
            updatedAt: task.updatedAt.toISOString(),
        })),
        notes: notes.map(note => ({
            ...note,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
        }))
    };

    return <ChatPageContent initialDataContext={serializedData} />;
}
