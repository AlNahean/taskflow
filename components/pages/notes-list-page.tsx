"use client"

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

export function NotesListPageContent({ initialNotes }: NotesListPageContentProps) {
    const router = useRouter();
    const { toast } = useToast();

    const handleCreateNote = async () => {
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Untitled Note' }),
            });
            if (!response.ok) throw new Error("Failed to create note");
            const newNote = await response.json();
            router.push(`/notes/${newNote.id}`);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not create a new note." });
        }
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
                <Button onClick={handleCreateNote}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initialNotes.map(note => (
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
