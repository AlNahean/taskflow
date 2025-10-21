"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type AIModel = 'gpt-4-turbo' | 'claude-3-opus-20240229' | 'gemini-2.5-pro' | 'gemini-2.5-flash';

export type AIFeature = 'chat' | 'summary' | 'suggestTasks' | 'suggestTitle';

export interface AIModelSettings {
    chat: AIModel;
    summary: AIModel;
    suggestTasks: AIModel;
    suggestTitle: AIModel;
}

interface SettingsContextType {
    models: AIModelSettings;
    setModelForFeature: (feature: AIFeature, model: AIModel) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aiModelSettings';

const defaultModels: AIModelSettings = {
    chat: 'gpt-4-turbo',
    summary: 'gpt-4-turbo',
    suggestTasks: 'gpt-4-turbo',
    suggestTitle: 'gpt-4-turbo',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [models, setModels] = useState<AIModelSettings>(defaultModels);

    useEffect(() => {
        const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSettings) {
            setModels({ ...defaultModels, ...JSON.parse(savedSettings) });
        }
    }, []);

    const setModelForFeature = (feature: AIFeature, model: AIModel) => {
        const newModels = { ...models, [feature]: model };
        setModels(newModels);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newModels));
    };

    return (
        <SettingsContext.Provider value={{ models, setModelForFeature }}>
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
