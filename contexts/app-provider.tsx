// File: E:/projects/sorties/task-management/task-manager-app/contexts/app-provider.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import { useTasks } from '@/hooks/use-tasks';
import type { CreateTaskInput } from '@/lib/schemas';

interface AppContextType {
    openTaskModal: (task?: Partial<CreateTaskInput>) => void;
    refetchTasks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTaskData, setModalTaskData] = useState<Partial<CreateTaskInput> | undefined>(undefined);
    const [modalKey, setModalKey] = useState(0); // Add a key state
    const { fetchTasks } = useTasks();

    const openTaskModal = useCallback((task?: Partial<CreateTaskInput>) => {
        setModalTaskData(task);
        setIsModalOpen(true);
        // Increment the key to force re-mounting the modal with new defaults
        setModalKey(prev => prev + 1);
    }, []);

    const refetchTasks = useCallback(() => {
        fetchTasks();
    }, [fetchTasks]);

    const onTaskCreated = () => {
        refetchTasks();
        setIsModalOpen(false);
    };

    return (
        <AppContext.Provider value={{ openTaskModal, refetchTasks }}>
            {children}
            <TaskFormModal
                // --- THIS IS THE FIX ---
                // Use the simple number key instead of JSON.stringify
                key={modalKey}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onTaskCreated={onTaskCreated}
                defaultValues={modalTaskData}
            />
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}