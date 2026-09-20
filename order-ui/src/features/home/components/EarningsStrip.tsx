import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFormat } from "@/features/preferences/hooks/useFormat";
import type { HomeEarnings, EarningsPeriod } from "@/types/home";

function Delta({ pct, vs, dark }: { pct: number | null; vs: string; dark?: boolean }) {
    if (pct === null) return <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{vs}</span>;
    const up = pct >= 0;
    const Icon = up ? TrendingUp : TrendingDown;
    const color = up ? (dark ? "text-emerald-400" : "text-emerald-600") : dark ? "text-rose-400" : "text-rose-600";
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {`${up ? "+" : ""}${pct.toFixed(0)}%`}
            <span className={dark ? "text-slate-500 font-normal" : "text-slate-400 font-normal"}>{vs}</span>
        </span>
    );
}

export function EarningsStrip({ earnings }: { earnings: HomeEarnings }) {
    const { t } = useTranslation("home");
    const { formatCurrency } = useFormat();
    const { today, week, month, trend } = earnings;
    const max = Math.max(1, ...trend.map((d) => d.revenue));

    const quiet = (label: string, p: EarningsPeriod, vs: string) => (
        <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
            <CardContent className="p-5 flex flex-col gap-1.5">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{formatCurrency(p.revenue)}</p>
                <p className="text-xs text-slate-400">{t("earnings.orders", { count: p.orders })}</p>
                <Delta pct={p.deltaPct} vs={vs} />
            </CardContent>
        </Card>
    );

    return (
        <section aria-label={t("earnings.title")} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-4">
            <Card className="bg-slate-950 border border-slate-800 rounded-[8px] shadow-none text-slate-50">
                <CardContent className="p-5 flex items-end justify-between gap-4 h-full">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <p className="text-sm text-slate-400">{t("earnings.today")}</p>
                        <p className="text-4xl font-semibold tabular-nums truncate">{formatCurrency(today.revenue)}</p>
                        <p className="text-xs text-slate-500">
                            {t("earnings.orders", { count: today.orders })}
                        </p>
                        <Delta pct={today.deltaPct} vs={t("earnings.vsYesterday")} dark />
                    </div>

                    <div className="flex items-end gap-1.5 h-16 flex-shrink-0" aria-hidden="true">
                        {trend.map((d, i) => (
                            <div
                                key={d.date}
                                title={`${d.date}: ${formatCurrency(d.revenue)}`}
                                className={`w-2.5 rounded-sm ${i === trend.length - 1 ? "bg-emerald-400" : "bg-slate-700"}`}
                                style={{ height: `${Math.max(6, (d.revenue / max) * 100)}%` }}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {quiet(t("earnings.week"), week, t("earnings.vsLastWeek"))}
            {quiet(t("earnings.month"), month, t("earnings.vsLastMonth"))}

            <Link
                to="/analytics"
                className="md:col-span-3 justify-self-end text-xs text-slate-400 hover:text-slate-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-slate-400 rounded"
            >
                {t("earnings.viewAnalytics")}
            </Link>
        </section>
    );
}
