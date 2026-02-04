"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, HistoryItem } from '@/types';

interface TrackerContextType {
    user: User | null;
    history: HistoryItem[];
    is24HourFormat: boolean;
    setUser: (user: User | null) => void;
    addHistoryItem: (item: HistoryItem) => void;
    clearHistory: () => void;
    toggleTimeFormat: () => void;
    logout: () => void;
    isLoading: boolean;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [is24HourFormat, setIs24HourFormat] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadState = () => {
            try {
                const storedUser = localStorage.getItem('tracker_user');
                if (storedUser) setUserState(JSON.parse(storedUser));

                const storedHistory = localStorage.getItem('tracker_history');
                if (storedHistory) setHistory(JSON.parse(storedHistory));

                const storedFormat = localStorage.getItem('time_format_24h');
                if (storedFormat) setIs24HourFormat(JSON.parse(storedFormat));
            } catch (e) {
                console.error("Failed to load state from localStorage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadState();
    }, []);

    // Persist User
    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            localStorage.setItem('tracker_user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('tracker_user');
        }
    };

    // Persist History
    const addHistoryItem = (item: HistoryItem) => {
        const newHistory = [item, ...history];
        setHistory(newHistory);
        localStorage.setItem('tracker_history', JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('tracker_history');
    };

    // Persist Format
    const toggleTimeFormat = () => {
        const newFormat = !is24HourFormat;
        setIs24HourFormat(newFormat);
        localStorage.setItem('time_format_24h', JSON.stringify(newFormat));
    };

    const logout = () => {
        setUser(null);
        // We usually keep history on device even after logout, but that's up to requirements.
        // The original app kept it confirmed by confirm('Are you sure you want to log out? Data will remain on device.')
    };

    return (
        <TrackerContext.Provider value={{
            user,
            history,
            is24HourFormat,
            setUser,
            addHistoryItem,
            clearHistory,
            toggleTimeFormat,
            logout,
            isLoading
        }}>
            {children}
        </TrackerContext.Provider>
    );
}

export function useTracker() {
    const context = useContext(TrackerContext);
    if (context === undefined) {
        throw new Error('useTracker must be used within a TrackerProvider');
    }
    return context;
}
