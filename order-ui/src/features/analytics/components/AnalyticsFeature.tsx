import { BarChart3, DollarSign, Clock, Percent } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";
import { KPICard } from "./KPICard";
import { RevenueChart } from "./RevenueChart";
import { ChannelChart } from "./ChannelChart";
import { Heatmap } from "./Heatmap";
import { TopItemsList } from "./TopItemsList";
import { AnalyticsHeader } from "./AnalyticsHeader";

export const AnalyticsFeature = () => {
    const { kpis, revenue, channels, topItems, heatmap } = useAnalytics();

    const kpiIcons = {
        "Total Revenue": DollarSign,
        "Total Orders": BarChart3,
        "Avg Delivery Time": Clock,
        "Cancellation Rate": Percent
    };

    return (
        <div className="min-h-full relative pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none z-0" style={{ 
                backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", 
                backgroundSize: "32px 32px", 
                opacity: 0.03 
            }} />

            
            <div className="relative px-8 pt-8 max-w-[1400px] mx-auto z-10">
                <AnalyticsHeader />

            <div className="grid grid-cols-4 gap-4 mb-6">
                {kpis.data?.map((kpi, idx) => (
                    <KPICard key={idx} data={{ ...kpi, icon: kpiIcons[kpi.label as keyof typeof kpiIcons] || BarChart3 }} />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Revenue over Time</h3>
                        <p className="text-sm text-slate-500">Daily revenue breakdown for the selected period.</p>
                    </div>
                    {revenue.data && <RevenueChart data={revenue.data} />}
                </div>

                <div className="col-span-1 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Peak Order Heatmap</h3>
                        <p className="text-sm text-slate-500">Order volume intensity by time.</p>
                    </div>
                    {heatmap.data && <Heatmap data={heatmap.data} />}
                </div>

                <div className="col-span-1 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm flex flex-col">
                    {topItems.data && <TopItemsList items={topItems.data} />}
                </div>

                <div className="col-span-1 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-900">Sales by Channel</h3>
                        <p className="text-sm text-slate-500">Revenue breakdown by origin.</p>
                    </div>
                    {channels.data && <ChannelChart data={channels.data} />}
                </div>
            </div>
            </div>
        </div>
    );
};