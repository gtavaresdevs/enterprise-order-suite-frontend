import { useState, useCallback } from "react";
import type { NotificationGroup, NotificationPreferencesState } from "@/types/notifications";

const DEFAULT_PREFS: NotificationPreferencesState = {
    "order-status": true,
    "shipment-alerts": true,
    "procurement": false,
    "maintenance": true,
    "performance": true,
    "api-status": false,
    "login-alerts": true,
    "password-change": true,
    "billing": true,
};

export function useNotificationPreferences() {
    const [enabled, setEnabled] = useState<NotificationPreferencesState>(DEFAULT_PREFS);
    const [globalMute, setGlobalMute] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const activeCount = Object.values(enabled).filter(Boolean).length;
    const totalCount = Object.keys(enabled).length;

    const toggleItem = useCallback((id: string, value: boolean) => {
        setEnabled((prev) => ({ ...prev, [id]: value }));
    }, []);

    const toggleGroup = useCallback((group: NotificationGroup, value: boolean) => {
        setEnabled((prev) => {
            const updates: NotificationPreferencesState = {};
            group.items.forEach((item) => { updates[item.id] = value; });
            return { ...prev, ...updates };
        });
    }, []);

    const isGroupOn = useCallback((group: NotificationGroup) => {
        return group.items.every((item) => enabled[item.id]);
    }, [enabled]);

    const toggleGlobalMute = useCallback((value: boolean) => {
        setGlobalMute(value);
    }, []);

    const savePreferences = useCallback(() => {
        // Simulating TanStack Query mutation lifecycle / service invocation
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2200);
    }, []);

    return {
        enabled,
        globalMute,
        isSaved,
        activeCount,
        totalCount,
        toggleItem,
        toggleGroup,
        isGroupOn,
        toggleGlobalMute,
        savePreferences,
    };
}