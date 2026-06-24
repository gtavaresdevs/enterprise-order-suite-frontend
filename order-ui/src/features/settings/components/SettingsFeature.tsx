import { useSettings } from "@/features/settings/hooks/useSettings";
import { SettingsHeader } from "@/features/settings/components/SettingsHeader";
import { SettingsSidebar } from "@/features/settings/components/SettingsSidebar";
import { SecurityPanel } from "@/features/settings/components/SecurityPanel";
import { ApiPanel } from "@/features/settings/components/ApiPanel";
import { SessionsPanel } from "@/features/settings/components/SessionsPanel";
import { DangerPanel } from "@/features/settings/components/DangerPanel";
import { SETTINGS_NAV } from "@/features/settings/constants/settings.constants";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function SettingsFeature() {
    const settings = useSettings();

    const ActivePanel = {
        security: <SecurityPanel prefs={settings.securityPrefs} onUpdatePref={settings.updateSecurityPref} />,
        api: <ApiPanel keys={settings.keys} onRevoke={settings.revokeKey} />,
        sessions: <SessionsPanel sessions={settings.sessions} onRevoke={settings.revokeSession} onRevokeAll={settings.revokeAllSessions} />,
        danger: <DangerPanel />,
    }[settings.activeSection];

    const activeNav = SETTINGS_NAV.find((n) => n.id === settings.activeSection)!;
    const ActiveIcon = activeNav.icon;

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[960px] mx-auto px-6 py-8 flex flex-col gap-8">

                <SettingsHeader />

                {/* Removed fractional grid grid-cols-[200px_1fr], replaced with Flexbox */}
                <div className="flex flex-col md:flex-row gap-5 items-start">

                    <div className="w-full md:w-[200px] flex-shrink-0">
                        <SettingsSidebar active={settings.activeSection} onChange={settings.setActiveSection} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="mb-4 flex items-center gap-2">
                            <ActiveIcon className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-700">{activeNav.label}</h2>
                        </div>
                        {ActivePanel}
                    </div>

                </div>
            </div>
        </div>
    );
}