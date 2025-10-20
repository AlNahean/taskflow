// File: E:/projects/sorties/task-management/task-manager-app/contexts/app-provider.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import type { CreateTaskInput, Task } from '@/lib/schemas';
import { useToast } from '@/components/ui/use-toast';

// Helper to parse date strings from the API into Date objects
const parseTaskDates = (task: any): Task => ({
    ...task,
    startDate: new Date(task.startDate),
    dueDate: new Date(task.dueDate),
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
});

interface AppContextType {
    tasks: Task[];
    loading: boolean;
    refetchTasks: () => void;
    openTaskModal: (task?: Partial<CreateTaskInput>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTaskData, setModalTaskData] = useState<Partial<CreateTaskInput> | undefined>(undefined);
    const [modalKey, setModalKey] = useState(0);

    // --- Task state logic moved here ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/tasks", { cache: 'no-store' });
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();
            setTasks(data.map(parseTaskDates));
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load tasks.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    // --- End of moved logic ---

    const openTaskModal = useCallback((task?: Partial<CreateTaskInput>) => {
        setModalTaskData(task);
        setIsModalOpen(true);
        setModalKey(prev => prev + 1);
    }, []);

    const onTaskCreated = () => {
        fetchTasks(); // Use the global fetchTasks
        setIsModalOpen(false);
    };

    return (
        <AppContext.Provider value={{ tasks, loading, refetchTasks: fetchTasks, openTaskModal }}>
            {children}
            <TaskFormModal
                key={modalKey}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onTaskCreated={onTaskCreated}
                defaultValues={modalTaskData}
            />
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
