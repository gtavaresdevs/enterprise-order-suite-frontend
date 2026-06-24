import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { SettingsSection } from "@/types/settings";
import { SETTINGS_NAV } from "@/features/settings/constants/settings.constants";

interface SettingsSidebarProps {
    active: SettingsSection;
    onChange: (section: SettingsSection) => void;
}

export function SettingsSidebar({ active, onChange }: SettingsSidebarProps) {
    return (
        <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-4 py-3 space-y-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settings</p>
            </CardHeader>
            <CardContent className="p-2 flex flex-col gap-0.5">
                {SETTINGS_NAV.map(({ id, icon: Icon, label }) => {
                    const isActive = active === id;
                    const isDanger = id === "danger";
                    return (
                        <button
                            key={id}
                            onClick={() => onChange(id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm font-medium text-left transition-all ${isActive
                                    ? isDanger
                                        ? "bg-red-600 text-white shadow-inner"
                                        : "bg-slate-950 text-slate-50 shadow-inner"
                                    : isDanger
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                }`}
                        >
                            <Icon
                                className={`w-4 h-4 flex-shrink-0 ${isActive
                                        ? isDanger ? "text-red-200" : "text-slate-400"
                                        : isDanger ? "text-red-400" : "text-slate-400"
                                    }`}
                            />
                            {label}
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}