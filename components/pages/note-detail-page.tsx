// File: components/pages/note-detail-page.tsx
"use client"

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Save } from "lucide-react";
import type { SuggestedTask as SuggestedTaskType } from "@/lib/schemas";
import { SuggestedTaskCard } from "@/components/ai/suggested-task-card";

interface SuggestedTaskWithParsedDates extends Omit<SuggestedTaskType, 'startDate' | 'dueDate'> {
    startDate: string | null;
    dueDate: string | null;
}

interface Note {
    id: string;
    title: string;
    content: string | null;
    createdAt: string;
    updatedAt: string;
    suggestedTasks: SuggestedTaskWithParsedDates[];
}

interface NoteDetailPageContentProps {
    note: Note;
}

export function NoteDetailPageContent({ note: initialNote }: NoteDetailPageContentProps) {
    const [title, setTitle] = React.useState(initialNote.title);
    const [content, setContent] = React.useState(initialNote.content || "");
    const [isSaving, setIsSaving] = React.useState(false);
    const [suggestedTasks, setSuggestedTasks] = React.useState<SuggestedTaskType[]>(
        initialNote.suggestedTasks.map(task => ({
            ...task,
            startDate: task.startDate ? new Date(task.startDate) : null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
        }))
    );
    const [isGenerating, setIsGenerating] = React.useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSave = async () => {
        // ... (handleSave logic is correct)
        setIsSaving(true);
        try {
            const response = await fetch(`/api/notes/${initialNote.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            if (!response.ok) throw new Error("Failed to save note");
            toast({ title: "Note Saved", description: "Your changes have been saved successfully." });
            router.refresh();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not save your changes." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateTasks = async () => {
        setIsGenerating(true);
        const notePayload = `${title}\n\n${content}`;
        try {
            const response = await fetch('/api/ai/suggest-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: notePayload, noteId: initialNote.id }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to generate tasks.");
            }

            const newSuggestions = await response.json();
            setSuggestedTasks(newSuggestions);
            toast({ title: "Suggestions updated!", description: "Refreshed tasks based on your note." });
        } catch (e: any) {
            console.error("Failed to generate tasks:", e);
            toast({
                variant: "destructive",
                title: "AI Generation Error",
                description: e.message || "The AI failed to generate tasks. Please try again."
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // --- JSX Below is Unchanged ---
    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-3xl font-bold h-auto border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                    placeholder="Note Title"
                />
                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your note here..."
                        className="min-h-[30vh] border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                    />
                </CardContent>
            </Card>

            <Button onClick={handleGenerateTasks} disabled={isGenerating || (!title.trim() && !content.trim())} className="w-full md:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate/Update Suggested Tasks"}
            </Button>

            {isGenerating && (
                <Card>
                    <CardHeader>
                        <CardTitle>Suggested Tasks</CardTitle>
                        <CardDescription>AI is analyzing your note... please wait.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                    </CardContent>
                </Card>
            )}

            {suggestedTasks.length > 0 && !isGenerating && (
                <Card>
                    <CardHeader>
                        <CardTitle>Suggested Tasks</CardTitle>
                        <CardDescription>Click "Add" to save a task to your list.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {suggestedTasks.map((task, index) => (
                            <SuggestedTaskCard key={task.id} task={task} />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
