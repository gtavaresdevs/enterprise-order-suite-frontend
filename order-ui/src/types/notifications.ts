import React from "react";

export interface NotificationItem {
    id: string;
    icon: React.ElementType;
    label: string;
    description: string;
}

export interface NotificationGroup {
    category: string;
    accent: string;
    items: NotificationItem[];
}

export type NotificationPreferencesState = Record<string, boolean>;