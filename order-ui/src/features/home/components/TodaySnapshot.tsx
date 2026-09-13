import { DollarSign, ShoppingBag, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useHomeData } from "../hooks/useHomeData";
import { useFormat } from "@/features/preferences/hooks/useFormat";

export function TodaySnapshot() {
    const { snapshot, isLoading } = useHomeData();
    const { formatCurrency } = useFormat();

    const tiles = snapshot
        ? [
            { label: "Revenue", value: formatCurrency(snapshot.revenue), icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
            { label: "Orders", value: String(snapshot.totalOrders), icon: ShoppingBag, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
            { label: "Avg Order Value", value: formatCurrency(snapshot.avgOrderValue), icon: Calculator, iconColor: "text-slate-600", iconBg: "bg-slate-100" },
        ]
        : [];

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Today's Snapshot
                </h2>
                {snapshot && (
                    <span className="text-xs text-slate-400 font-mono">{snapshot.snapshotDate}</span>
                )}
            </div>

            {isLoading ? (
                <p className="text-sm text-slate-400 font-mono animate-pulse">Loading snapshot...</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {tiles.map((tile) => {
                        const Icon = tile.icon;
                        return (
                            <Card key={tile.label} className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${tile.iconBg}`}>
                                        <Icon className={`w-4 h-4 ${tile.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                                            {tile.label}
                                        </p>
                                        <p className="text-base font-semibold text-slate-900 truncate">
                                            {tile.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                        <CardContent className="p-4">
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2.5">
                                Orders by Channel
                            </p>
                            <div className="flex flex-col gap-2">
                                {snapshot?.channelCounts.map((c) => (
                                    <div key={c.channel} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 font-medium">{c.channel}</span>
                                        <span className="font-mono text-slate-900 font-semibold">{c.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    );
}
