import { useState, useCallback } from "react";
import type { SettingsSection, ApiKey, ActiveSession, SecurityPreferences } from "@/types/settings";
import { API_KEYS_INIT, SESSIONS_INIT } from "@/features/settings/constants/settings.constants";

// In a real application, TanStack Query would handle fetching and mutations here.
export function useSettings() {
    const [activeSection, setActiveSection] = useState<SettingsSection>("security");
    const [keys, setKeys] = useState<ApiKey[]>(API_KEYS_INIT);
    const [sessions, setSessions] = useState<ActiveSession[]>(SESSIONS_INIT);
    const [securityPrefs, setSecurityPrefs] = useState<SecurityPreferences>({ twoFA: true, loginAlerts: true });

    const revokeKey = useCallback((id: string) => {
        setKeys((prev) => prev.filter((k) => k.id !== id));
    }, []);

    const revokeSession = useCallback((id: string) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const revokeAllSessions = useCallback(() => {
        setSessions((prev) => prev.filter((s) => s.current));
    }, []);

    const updateSecurityPref = useCallback((key: keyof SecurityPreferences, value: boolean) => {
        setSecurityPrefs((prev) => ({ ...prev, [key]: value }));
    }, []);

    return {
        activeSection,
        setActiveSection,
        keys,
        revokeKey,
        sessions,
        revokeSession,
        revokeAllSessions,
        securityPrefs,
        updateSecurityPref,
    };
}