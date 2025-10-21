"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/contexts/settings-provider";

export function DailySummaryCard() {
    const [summary, setSummary] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();
    const { models } = useSettings();

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setSummary(null); // Clear previous summary
        try {
            const response = await fetch('/api/ai/daily-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: models.summary }),
            });
            if (!response.ok) {
                throw new Error("The AI failed to generate a summary.");
            }
            const data = await response.json();
            setSummary(data.summary);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: error.message || "Could not generate your daily summary.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Daily Summary</CardTitle>
                <CardDescription>Get a quick, intelligent overview of your day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}

                {summary && !isLoading && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{summary}</p>
                    </div>
                )}

                {!summary && !isLoading && (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Click the button to generate your summary for today.</p>
                    </div>
                )}

                <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full md:w-auto">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isLoading ? "Generating..." : "Generate Today's Summary"}
                </Button>
            </CardContent>
        </Card>
    );
}
