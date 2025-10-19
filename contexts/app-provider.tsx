// File: E:/projects/sorties/task-management/task-manager-app/contexts/app-provider.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import { useTasks } from '@/hooks/use-tasks';

interface AppContextType {
    openTaskModal: () => void;
    refetchTasks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchTasks } = useTasks();

    const openTaskModal = useCallback(() => {
        setIsModalOpen(true);
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
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onTaskCreated={onTaskCreated}
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