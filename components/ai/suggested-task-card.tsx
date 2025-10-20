"use client"

"use client"

import type { CreateTaskInput } from "@/lib/schemas";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { useApp } from "@/contexts/app-provider";

interface SuggestedTaskCardProps {
    task: CreateTaskInput;
    onTaskAdded: () => void; // Keep for potential future use, though modal handles refetch now
}

export function SuggestedTaskCard({ task }: SuggestedTaskCardProps) {
    const { openTaskModal } = useApp();

    const handleReview = () => {
        // Open the global task form modal with the AI-suggested data
        openTaskModal(task);
    };

    return (
        <Card className="flex flex-col justify-between transition-all">
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
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Review & Add
                </Button>
            </CardFooter>
        </Card>
    );
}
