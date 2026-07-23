import type { PreferencesState } from "@/types/preferences";

export const preferencesService = {
    getPreferences: async (): Promise<Partial<PreferencesState>> => {
        return Promise.resolve({});
    },

    savePreferences: async (_preferences: PreferencesState): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, 500));
    }
};