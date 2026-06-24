import React from "react";

export type SettingsSection = "security" | "api" | "sessions" | "danger";

export interface SettingsNavItem {
    id: SettingsSection;
    icon: React.ElementType;
    label: string;
}

export interface ApiKey {
    id: string;
    label: string;
    prefix: string;
    created: string;
    last: string;
    scope: "read-only" | "read/write";
}

export interface ActiveSession {
    id: string;
    device: string;
    ip: string;
    location: string;
    time: string;
    current: boolean;
}

export interface SecurityPreferences {
    twoFA: boolean;
    loginAlerts: boolean;
}