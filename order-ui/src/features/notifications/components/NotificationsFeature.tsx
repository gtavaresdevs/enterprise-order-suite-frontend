import { useNotificationPreferences } from "@/features/notifications/hooks/useNotificationPreferences";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { NotificationsHeader } from "@/features/notifications/components/NotificationsHeader";
import { NotificationsStatusBanner } from "@/features/notifications/components/NotificationsStatusBanner";
import { NotificationGroupCard } from "@/features/notifications/components/NotificationGroupCard";
import { SavePreferencesButton } from "@/features/notifications/components/SavePreferencesButton";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function NotificationsFeature() {
    const { groups } = useNotifications();
    const preferences = useNotificationPreferences();

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[800px] mx-auto px-6 py-8 flex flex-col gap-8">
                <NotificationsHeader />

                <div className="flex flex-col gap-6">
                    <NotificationsStatusBanner
                        globalMute={preferences.globalMute}
                        activeCount={preferences.activeCount}
                        totalCount={preferences.totalCount}
                        onToggleMute={preferences.toggleGlobalMute}
                    />

                    <div className="flex flex-col gap-4">
                        {groups.map((group) => (
                            <NotificationGroupCard
                                key={group.category}
                                group={group}
                                enabled={preferences.enabled}
                                globalMute={preferences.globalMute}
                                isGroupOn={preferences.isGroupOn(group)}
                                onToggleGroup={(v) => preferences.toggleGroup(group, v)}
                                onToggleItem={preferences.toggleItem}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <SavePreferencesButton
                            isSaved={preferences.isSaved}
                            onSave={preferences.savePreferences}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}