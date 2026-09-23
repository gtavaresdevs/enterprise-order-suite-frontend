import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import type { ChannelCount, StatusCount } from "@/types/home";

const STATUS_STYLE: Record<StatusCount["status"], string> = {
    New: "text-blue-600",
    Preparing: "text-amber-600",
    Ready: "text-emerald-600",
};

interface ActiveOrdersProps {
    statusCounts: StatusCount[];
    channelCounts: ChannelCount[];
}

export function ActiveOrders({ statusCounts, channelCounts }: ActiveOrdersProps) {
    const { t } = useTranslation("home");
    const { t: tOrders } = useTranslation("orders");
    const maxChannel = Math.max(1, ...channelCounts.map((c) => c.count));

    return (
        <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800">{t("activeOrders.title")}</h2>

            <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                <CardContent className="p-5 space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                        {statusCounts.map(({ status, count }) => (
                            <Link
                                key={status}
                                to="/orders"
                                className="rounded-[8px] border border-slate-100 p-3 hover:border-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-slate-500"
                            >
                                <p className={`text-2xl font-semibold tabular-nums ${STATUS_STYLE[status]}`}>{count}</p>
                                <p className="text-xs text-slate-500">{tOrders(`status.${status.toLowerCase()}`)}</p>
                            </Link>
                        ))}
                    </div>

                    <div className="space-y-2.5">
                        <p className="text-xs text-slate-400">{t("activeOrders.byChannel")}</p>
                        {channelCounts.map((c) => (
                            <div key={c.channel} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{c.channel}</span>
                                    <span className="font-semibold tabular-nums text-slate-900">{c.count}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100" aria-hidden="true">
                                    <div
                                        className="h-full rounded-full bg-slate-800"
                                        style={{ width: `${(c.count / maxChannel) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
