import { NOTIFICATION_GROUPS } from "@/features/notifications/constants/notifications.constants";

export function useNotifications() {
    // In a full implementation, TanStack Query would orchestrate the fetching here:
    // const { data } = useQuery({ queryKey: ['notifications'], queryFn: notificationsService.getGroups })

    return {
        groups: NOTIFICATION_GROUPS,
    };
}