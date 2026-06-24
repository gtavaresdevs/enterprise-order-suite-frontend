import { Shield, Key, MonitorSmartphone, AlertTriangle } from "lucide-react";
import type { ApiKey, ActiveSession, SettingsNavItem } from "@/types/settings";

export const API_KEYS_INIT: ApiKey[] = [
    { id: "k1", label: "Production Webhook", prefix: "eos_live_4xKz", created: "Sep 12, 2024", last: "2 hours ago", scope: "read/write" },
    { id: "k2", label: "Analytics Pipeline", prefix: "eos_live_9mRq", created: "Jul 3, 2024", last: "Yesterday", scope: "read-only" },
    { id: "k3", label: "CI Test Environment", prefix: "eos_test_2nJw", created: "Oct 29, 2024", last: "5 minutes ago", scope: "read-only" },
];

export const SESSIONS_INIT: ActiveSession[] = [
    { id: "s1", device: "Chrome · macOS", ip: "12.34.56.78", location: "San Francisco, CA", time: "Active now", current: true },
    { id: "s2", device: "Safari · iPhone 15 Pro", ip: "12.34.56.79", location: "San Jose, CA", time: "3 hours ago", current: false },
    { id: "s3", device: "Firefox · Windows 11", ip: "88.197.14.22", location: "London, UK", time: "2 days ago", current: false },
    { id: "s4", device: "Edge · Windows 11", ip: "210.88.12.54", location: "Tokyo, JP", time: "6 days ago", current: false },
];

export const SETTINGS_NAV: SettingsNavItem[] = [
    { id: "security", icon: Shield, label: "Security" },
    { id: "api", icon: Key, label: "API Keys" },
    { id: "sessions", icon: MonitorSmartphone, label: "Active Sessions" },
    { id: "danger", icon: AlertTriangle, label: "Danger Zone" },
];