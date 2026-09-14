import { RECENT_NOTIFICATIONS } from "@/features/notifications/constants/notifications.constants";

export function useNotificationFeed() {
    // Mock feed only — this app does not have a real-time notifications backend yet.
    const notifications = RECENT_NOTIFICATIONS;
    const unreadCount = notifications.filter((n) => !n.read).length;

    return { notifications, unreadCount };
}
