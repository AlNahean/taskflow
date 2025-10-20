import { NotesListPageContent } from "@/components/pages/notes-list-page";
import prisma from "@/lib/prisma";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function NotesPage() {
    const notes = await prisma.note.findMany({
        orderBy: { updatedAt: 'desc' },
    });

    // Serialize dates for client component
    const serializedNotes = notes.map(note => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
    }));

    return <NotesListPageContent initialNotes={serializedNotes} />;
}
