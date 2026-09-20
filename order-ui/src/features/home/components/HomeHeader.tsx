import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTimestamp } from "../hooks/useTimestamp";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HomeHeader() {
    const { t } = useTranslation("home");
    const { greetingPeriod, dateStr, timeStr } = useTimestamp();
    const { user } = useAuth();
    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || t("header.fallbackName");

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
                    {t(`header.greeting.${greetingPeriod}`, { name: displayName })}
                </h1>
                <p className="text-sm text-slate-400 capitalize">
                    {dateStr} <span className="tabular-nums">· {timeStr}</span>
                </p>
            </div>

            <Link
                to="/orders?new=1"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-slate-950 text-slate-50 text-sm font-semibold border border-slate-800 shadow-inner hover:bg-slate-800 active:scale-[0.98] transition-all flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
                <Plus className="w-4 h-4" />
                {t("header.newOrder")}
            </Link>
        </div>
    );
}
