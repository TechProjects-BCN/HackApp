"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../utils/translations';
import { getBackendUrl } from '../utils/config';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && translations[saved]) {
            setLanguage(saved);
        } else {
            // Fetch default from server if no local preference
            fetch(`${getBackendUrl()}/admin/config/language`)
                .then(res => res.json())
                .then(data => {
                    if (data.language && translations[data.language as Language]) {
                        setLanguage(data.language as Language);
                    }
                })
                .catch(e => console.error("Failed to fetch default language", e));
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
