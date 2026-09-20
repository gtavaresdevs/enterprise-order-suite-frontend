import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTimestamp } from "../hooks/useTimestamp";
import { useProfileSummary } from "@/features/profile/hooks/useProfileSummary";

export function HomeHeader() {
    const { t } = useTranslation("home");
    const { greetingPeriod, dateStr, timeStr } = useTimestamp();
    const { fullName, displayName, isPending } = useProfileSummary();
    // No name in the token yet and the profile is still loading: show a placeholder instead of a wrong name.
    const waitingForName = isPending && !fullName;

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
                {waitingForName ? (
                    <div className="h-8 w-64 rounded bg-slate-100 animate-pulse" role="status" aria-label={t("loading")} />
                ) : (
                    <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
                        {t(`header.greeting.${greetingPeriod}`, { name: fullName || displayName })}
                    </h1>
                )}
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
