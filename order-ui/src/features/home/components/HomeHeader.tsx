import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTimestamp } from "../hooks/useTimestamp";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HomeHeader() {
    const { t } = useTranslation("home");
    const { greetingPeriod, dateStr, timeStr } = useTimestamp();
    const { user } = useAuth();
    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || t("header.fallbackName");

    return (
        <div className="flex items-start justify-between mb-8">

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-950 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-3 h-3 text-slate-100" />
                    </div>

                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                        {t("header.brandLabel")}
                    </span>
                </div>

                <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
                    {t(`header.greeting.${greetingPeriod}`)}, <span className="text-slate-500">{displayName}</span>
                </h1>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{dateStr}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="font-mono text-sm text-slate-400">{timeStr}</span>
                </div>
            </div>
        </div>
    );
}