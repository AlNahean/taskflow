// File: components/ai/suggested-task-card.tsx
"use client"

import type { CreateTaskInput, SuggestedTask } from "@/lib/schemas";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle2 } from "lucide-react";
import { useAppContext } from "@/contexts/app-provider";

interface SuggestedTaskCardProps {
    task: SuggestedTask;
}

export function SuggestedTaskCard({ task }: SuggestedTaskCardProps) {
    const { openTaskModal } = useAppContext();

    const handleReview = () => {
        // Open the global task form modal with the AI-suggested data
        const modalData: Partial<CreateTaskInput> = {
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category,
            status: task.status,
            // The form requires a Date object, but dueDate is required so we provide a fallback
            startDate: task.startDate ? new Date(task.startDate) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
            suggestionId: task.id, // Pass the suggestion ID to the modal
        };
        openTaskModal(modalData);
    };

    return (
        <Card className={`flex flex-col justify-between transition-all ${task.isAdded ? 'bg-muted/50 border-dashed' : ''
            }`}>
            <CardHeader>
                <CardTitle className="line-clamp-2">{task.title}</CardTitle>
                {task.description && (
                    <CardDescription className="line-clamp-3">{task.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">Due: {task.dueDate ? format(new Date(task.dueDate), "MMM d") : 'N/A'}</Badge>
                    <Badge variant="secondary">{task.priority}</Badge>
                    <Badge variant="secondary">{task.category}</Badge>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleReview}
                    className="w-full"
                    disabled={task.isAdded}
                    variant={task.isAdded ? "secondary" : "default"}
                >
                    {task.isAdded ? (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Added to Tasks
                        </>
                    ) : (
                        <>
                            <Edit className="mr-2 h-4 w-4" />
                            Review & Add
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
