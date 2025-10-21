"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type AIModel = 'gpt-4-turbo' | 'claude-3-opus-20240229' | 'gemini-2.5-pro' | 'gemini-2.5-flash';

interface SettingsContextType {
    defaultModel: AIModel;
    setDefaultModel: (model: AIModel) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'defaultAIModel';

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [defaultModel, setDefaultModel] = useState<AIModel>('gpt-4-turbo'); // Default fallback

    useEffect(() => {
        // On initial load, try to get the saved model from localStorage
        const savedModel = localStorage.getItem(LOCAL_STORAGE_KEY) as AIModel | null;
        if (savedModel) {
            setDefaultModel(savedModel);
        }
    }, []);

    const handleSetDefaultModel = (model: AIModel) => {
        setDefaultModel(model);
        localStorage.setItem(LOCAL_STORAGE_KEY, model);
    };

    return (
        <SettingsContext.Provider value={{ defaultModel, setDefaultModel: handleSetDefaultModel }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
