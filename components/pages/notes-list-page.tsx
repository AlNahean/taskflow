// File: components/pages/notes-list-page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateNote } from "@/hooks/use-notes";

interface Note {
    id: string;
    title: string;
    content: string | null;
    createdAt: string;
    updatedAt: string;
}

interface NotesListPageContentProps {
    initialNotes: Note[];
}

export function NotesListPageContent({
    initialNotes,
}: NotesListPageContentProps) {
    const { mutate: createNote, isPending } = useCreateNote();

    const handleCreateNote = () => {
        createNote({ title: "Untitled Note" });
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Notes</h1>
                    <p className="text-sm text-muted-foreground">
                        Create and manage your notes. Generate tasks with AI.
                    </p>
                </div>
                <Button onClick={handleCreateNote} disabled={isPending}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initialNotes.map((note) => (
                    <Link href={`/notes/${note.id}`} key={note.id}>
                        <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                                <CardDescription className="line-clamp-3">
                                    {note.content || "No additional content."}
                                </CardDescription>
                            </CardHeader>
                            <div className="mt-auto p-4 pt-0">
                                <p className="text-xs text-muted-foreground">
                                    Last updated: {format(new Date(note.updatedAt), "MMM d, yyyy")}
                                </p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
