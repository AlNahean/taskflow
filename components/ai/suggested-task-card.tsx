// File: components/ai/suggested-task-card.tsx
"use client"

import { CreateTaskInput, SuggestedTask, Task } from "@/lib/schemas"; // Import the Task type
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle2 } from "lucide-react";
import { useModalStore } from "@/stores/use-modal-store";

interface SuggestedTaskCardProps {
    // The incoming task prop will now potentially have a 'createdTask' object
    task: SuggestedTask & { createdTask?: Task | null };
}

export function SuggestedTaskCard({ task }: SuggestedTaskCardProps) {
    const { openTaskModal } = useModalStore();

    const handleReview = () => {
        const modalData: Partial<CreateTaskInput> = {
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category,
            status: task.status,
            startDate: task.startDate ? new Date(task.startDate) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
            suggestedTaskId: task.id, // Use the updated field name
        };
        openTaskModal(modalData);
    };

    return (
        <Card className={`flex flex-col justify-between transition-all ${task.isAdded ? 'bg-muted/50 border-dashed' : ''}`}>
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
                    {/* --- ADD THIS BLOCK --- */}
                    {/* If the task is added and we have its status, display it */}
                    {task.isAdded && task.createdTask && (
                        <Badge variant="default" className="capitalize">
                            Status: {task.createdTask.status.replace('_', '-')}
                        </Badge>
                    )}
                    {/* --- END OF BLOCK --- */}
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
