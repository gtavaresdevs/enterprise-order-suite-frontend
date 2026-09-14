import type { PreferencesState } from "@/types/preferences";

const STORAGE_KEY = "preferences";

export const preferencesService = {
    getPreferences: async (): Promise<Partial<PreferencesState>> => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        try {
            return JSON.parse(raw) as Partial<PreferencesState>;
        } catch {
            return {};
        }
    },

    savePreferences: async (preferences: PreferencesState): Promise<void> => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
};