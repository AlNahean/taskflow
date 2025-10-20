import { NoteDetailPageContent } from "@/components/pages/note-detail-page";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;


async function getNote(id: string) {
    const note = await prisma.note.findUnique({
        where: { id },
    });
    if (!note) {
        notFound();
    }
    return {
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
    };
}

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
    const note = await getNote(params.id);
    return <NoteDetailPageContent note={note} />;
}
