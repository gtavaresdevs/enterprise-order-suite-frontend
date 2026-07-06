import { useState, useCallback } from "react";
import type { PreferencesState } from "@/types/preferences";
import {
    LANGUAGES,
    TIMEZONES,
    DATE_FORMATS,
    CURRENCIES,
    FONT_SIZES,
} from "@/features/preferences/constants/preferences.constants";

const DEFAULT_PREFERENCES: PreferencesState = {
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
};

export function usePreferences() {
    const [preferences, setPreferences] = useState<PreferencesState>(DEFAULT_PREFERENCES);
    const [isSaved, setIsSaved] = useState(false);

    const updatePreference = useCallback(<K extends keyof PreferencesState>(
        key: K,
        value: PreferencesState[K]
    ) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    }, []);

    const savePreferences = useCallback(() => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2200);
    }, []);

    return {
        preferences,
        isSaved,
        updatePreference,
        savePreferences,
    };
}