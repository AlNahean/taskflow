// File: components/pages/note-detail-page.tsx
"use client"

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Save, MoreVertical, Lightbulb, Trash2 } from "lucide-react";
import type { SuggestedTask as SuggestedTaskType } from "@/lib/schemas";
import { SuggestedTaskCard } from "@/components/ai/suggested-task-card";
import { useDeleteNote } from "@/hooks/use-notes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    const [isSuggestingTitle, setIsSuggestingTitle] = React.useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote();

    const handleSave = async () => {
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

    const handleSuggestTitle = async () => {
        if (content.length < 20) {
            toast({ variant: "destructive", title: "Note too short", description: "Please write at least 20 characters to generate a title." });
            return;
        }
        setIsSuggestingTitle(true);
        try {
            const response = await fetch('/api/ai/suggest-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) throw new Error("Failed to suggest title");
            const data = await response.json();
            setTitle(data.title);
            toast({ title: "Title Suggested!", description: "The AI has generated a new title for your note." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not generate a title." });
        } finally {
            setIsSuggestingTitle(false);
        }
    };

    const handleDelete = () => {
        deleteNote(initialNote.id);
    };


    return (
        <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4">
                <Textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-3xl font-bold h-auto border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 resize-none"
                    placeholder="Note Title"
                    rows={1}
                />
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleSuggestTitle} disabled={isSuggestingTitle}>
                                    <Lightbulb className="mr-2 h-4 w-4" />
                                    <span>Suggest Title</span>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete Note</span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this note and all of its suggestions. Tasks created from this note will not be deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Yes, delete note
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note here..."
                className="min-h-[50vh] text-base border rounded-xl p-6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />

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
                        <CardDescription>Click a suggestion to review and add it to your tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {suggestedTasks.map((task) => (
                            <SuggestedTaskCard key={task.id} task={task} />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
