// File: E:/projects/sorties/task-management/task-manager-app/components/pages/note-detail-page.tsx
"use client"

import * as React from "react";
import { useCompletion } from "ai/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Save } from "lucide-react";
import type { CreateTaskInput } from "@/lib/schemas";
import { SuggestedTaskCard } from "@/components/ai/suggested-task-card";
import { useAppContext } from "@/contexts/app-provider"; // Corrected import path/name

interface Note {
    id: string;
    title: string;
    content: string | null;
    createdAt: string;
    updatedAt: string;
}

interface NoteDetailPageContentProps {
    note: Note;
}

export function NoteDetailPageContent({ note: initialNote }: NoteDetailPageContentProps) {
    const [title, setTitle] = React.useState(initialNote.title);
    const [content, setContent] = React.useState(initialNote.content || "");
    const [isSaving, setIsSaving] = React.useState(false);
    const [suggestedTasks, setSuggestedTasks] = React.useState<CreateTaskInput[]>([]);
    const router = useRouter();
    const { toast } = useToast();
    // --- THIS IS THE FIX ---
    const { refetchTasks } = useAppContext(); // Use the correct hook name

    const { complete, isLoading, error } = useCompletion({
        api: '/api/ai/suggest-tasks',
        onFinish: (prompt, completion) => {
            // ... (onFinish logic is correct)
            try {
                const parsed = JSON.parse(completion);
                if (parsed.tasks && Array.isArray(parsed.tasks)) {
                    setSuggestedTasks(parsed.tasks);
                } else {
                    throw new Error("Invalid JSON structure from AI.");
                }
            } catch (e) {
                console.error("Failed to parse AI response:", e);
                toast({
                    variant: "destructive",
                    title: "AI Response Error",
                    description: "The AI returned an invalid format. Please try again."
                });
                setSuggestedTasks([]);
            }
        },
        onError: (err) => {
            // ... (onError logic is correct)
            toast({
                variant: "destructive",
                title: "An Error Occurred",
                description: err.message || "Something went wrong while generating tasks.",
            });
        }
    });

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

    const handleGenerateTasks = () => {
        // ... (handleGenerateTasks logic is correct)
        const notePayload = `${title}\n\n${content}`;
        setSuggestedTasks([]);
        complete(notePayload);
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

            <Button onClick={handleGenerateTasks} disabled={isLoading || (!title.trim() && !content.trim())} className="w-full md:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Generate Tasks from this Note"}
            </Button>

            {error && !isLoading && (
                <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Generation Failed</CardTitle>
                        <CardDescription className="text-destructive/80">
                            There was an issue connecting to the AI service. Please check your API key and try again.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {isLoading && (
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

            {suggestedTasks.length > 0 && !isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Suggested Tasks</CardTitle>
                        <CardDescription>Click "Add" to save a task to your list.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {suggestedTasks.map((task, index) => (
                            <SuggestedTaskCard key={index} task={task} onTaskAdded={refetchTasks} />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}