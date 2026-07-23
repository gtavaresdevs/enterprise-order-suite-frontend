import type { ApiKey, ActiveSession, SecurityPreferences } from "@/types/settings";
import { API_KEYS_INIT, SESSIONS_INIT } from "@/features/settings/constants/settings.constants";

export const settingsService = {
    getApiKeys: async (): Promise<ApiKey[]> => Promise.resolve(API_KEYS_INIT),
    getSessions: async (): Promise<ActiveSession[]> => Promise.resolve(SESSIONS_INIT),
    getSecurityPreferences: async (): Promise<SecurityPreferences> => Promise.resolve({ twoFA: true, loginAlerts: true }),

    revokeKey: async (_id: string): Promise<void> => new Promise(resolve => setTimeout(resolve, 300)),
    revokeSession: async (_id: string): Promise<void> => new Promise(resolve => setTimeout(resolve, 300)),
    revokeAllSessions: async (): Promise<void> => new Promise(resolve => setTimeout(resolve, 400)),
    updatePreferences: async (_prefs: Partial<SecurityPreferences>): Promise<void> => new Promise(resolve => setTimeout(resolve, 300)),
    deleteAccount: async (): Promise<void> => new Promise(resolve => setTimeout(resolve, 1000)),
};