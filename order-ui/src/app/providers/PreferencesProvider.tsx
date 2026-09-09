import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PreferencesState } from "@/types/preferences";
import { preferencesService } from "@/features/preferences/services/preferences.service";
import {
    LANGUAGES,
    TIMEZONES,
    DATE_FORMATS,
    CURRENCIES,
    FONT_SIZES,
} from "@/features/preferences/constants/preferences.constants";

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_PREFERENCES: PreferencesState = {
    theme: "light",
    fontSize: FONT_SIZES[1],
    compactMode: false,
    denseTable: true,
    reducedMotion: false,
    language: LANGUAGES[0],
    timezone: TIMEZONES[0],
    dateFormat: DATE_FORMATS[0],
    currency: CURRENCIES[0],
    sidebarNavigation: "expanded",
    storefrontLogo: null,
    storefrontCover: null,
    storefrontBrandColor: "#0f172a",
};

interface PreferencesContextValue {
    preferences: PreferencesState;
    isSaved: boolean;
    updatePreference: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => void;
    savePreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<PreferencesState>(DEFAULT_PREFERENCES);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        preferencesService.getPreferences().then((stored) => {
            setPreferences((prev) => ({ ...prev, ...stored }));
        });
    }, []);

    const updatePreference = useCallback(<K extends keyof PreferencesState>(
        key: K,
        value: PreferencesState[K]
    ) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    }, []);

    const savePreferences = useCallback(() => {
        preferencesService.savePreferences(preferences).catch((err) => console.error("Failed to save preferences", err));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2200);
    }, [preferences]);

    return (
        <PreferencesContext.Provider value={{ preferences, isSaved, updatePreference, savePreferences }}>
            {children}
        </PreferencesContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferencesContext(): PreferencesContextValue {
    const ctx = useContext(PreferencesContext);
    if (!ctx) {
        throw new Error("usePreferencesContext must be used within a PreferencesProvider");
    }
    return ctx;
}
