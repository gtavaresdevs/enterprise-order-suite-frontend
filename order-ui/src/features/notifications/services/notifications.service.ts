import { NOTIFICATION_GROUPS } from "@/features/notifications/constants/notifications.constants";
import type { NotificationGroup, NotificationPreferencesState } from "@/types/notifications";

export const notificationsService = {
  // Simulates an API call to fetch grouped configurations
  getGroups: async (): Promise<NotificationGroup[]> => {
    return Promise.resolve(NOTIFICATION_GROUPS);
  },
  
  // Simulates an API save mutation
  savePreferences: async (preferences: NotificationPreferencesState, globalMute: boolean): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
};