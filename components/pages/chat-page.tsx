// File: E:/projects/sorties/task-management/task-manager-app/components/pages/chat-page.tsx
"use client"

import * as React from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSettings, AIModel } from "@/contexts/settings-provider"; // Import from settings context

interface ChatPageContentProps {
    initialDataContext: {
        tasks: any[],
        notes: any[],
    };
}

export function ChatPageContent({ initialDataContext }: ChatPageContentProps) {
    const { models, setModelForFeature } = useSettings();
    const [selectedModel, setSelectedModel] = React.useState<AIModel>(models.chat);

    React.useEffect(() => {
        setSelectedModel(models.chat);
    }, [models.chat]);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat",
        body: {
            model: selectedModel,
            data: initialDataContext,
        },
    });

    const handleModelChange = (model: AIModel) => {
        setSelectedModel(model);
        setModelForFeature('chat', model); // Also update the default in settings
    };

    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">AI Chat</h1>
                    <p className="text-sm text-muted-foreground">
                        Ask questions about your tasks and notes.
                    </p>
                </div>
                <Select value={selectedModel} onValueChange={handleModelChange} disabled={isLoading}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 flex flex-col p-4 gap-4">
                    <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                        <div className="space-y-6">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground pt-12">
                                    <p>Ask something like: "What are my most urgent tasks?"</p>
                                </div>
                            )}
                            {messages.map((m, index) => (
                                <div key={m.id} className="flex items-start gap-4">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback>
                                            {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="prose prose-sm dark:prose-invert max-w-none pt-1 w-full">
                                        <p className="whitespace-pre-wrap">{m.content}</p>
                                        {m.role === 'assistant' && isLoading && index === messages.length - 1 && (
                                            <span className="h-4 w-1 bg-primary inline-block animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask about your tasks or notes..."
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
