import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { SettingsHeader } from "@/features/settings/components/SettingsHeader";
import { SettingsSidebar } from "@/features/settings/components/SettingsSidebar";
import { SecurityPanel } from "@/features/settings/components/SecurityPanel";
import { ApiPanel } from "@/features/settings/components/ApiPanel";
import { SessionsPanel } from "@/features/settings/components/SessionsPanel";
import { DangerPanel } from "@/features/settings/components/DangerPanel";
import { SETTINGS_NAV } from "@/features/settings/constants/settings.constants";
import type { SettingsSection } from "@/types/settings";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function SettingsFeature() {
    const settings = useSettings();
    const [activeSection, setActiveSection] = useState<SettingsSection>("security");
    const sectionRefs = useRef<Partial<Record<SettingsSection, HTMLElement>>>({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) {
                    setActiveSection(visible.target.id as SettingsSection);
                }
            },
            { rootMargin: "-15% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
        );

        Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    function scrollToSection(id: SettingsSection) {
        sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[960px] mx-auto px-6 py-8 flex flex-col gap-8">

                <SettingsHeader />

                <div className="flex flex-col md:flex-row gap-5 items-start">

                    <div className="w-full md:w-[200px] flex-shrink-0 md:sticky md:top-8">
                        <SettingsSidebar active={activeSection} onChange={scrollToSection} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-10">
                        {SETTINGS_NAV.map(({ id, icon: Icon, label }) => (
                            <section
                                key={id}
                                id={id}
                                ref={(el) => {
                                    if (el) sectionRefs.current[id] = el;
                                }}
                                className="scroll-mt-8 flex flex-col"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-slate-400" />
                                    <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
                                </div>
                                {id === "security" && (
                                    <SecurityPanel prefs={settings.securityPrefs} onUpdatePref={settings.updateSecurityPref} />
                                )}
                                {id === "api" && <ApiPanel keys={settings.keys} onRevoke={settings.revokeKey} />}
                                {id === "sessions" && (
                                    <SessionsPanel sessions={settings.sessions} onRevoke={settings.revokeSession} onRevokeAll={settings.revokeAllSessions} />
                                )}
                                {id === "danger" && <DangerPanel />}
                            </section>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
