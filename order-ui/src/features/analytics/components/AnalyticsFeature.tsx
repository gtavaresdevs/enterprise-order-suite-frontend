import { Calendar, Download, BarChart3, DollarSign, Clock, Percent } from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";
import { KPICard } from "./KPICard";
import { RevenueChart } from "./RevenueChart";
import { ChannelChart } from "./ChannelChart";
import { Heatmap } from "./Heatmap";
import { TopItemsList } from "./TopItemsList";

export const AnalyticsFeature = () => {
    const { kpis, revenue, channels, topItems, heatmap } = useAnalytics();

    const kpiIcons = {
        "Total Revenue": DollarSign,
        "Total Orders": BarChart3,
        "Avg Delivery Time": Clock,
        "Cancellation Rate": Percent
    };

    return (
        <div className="relative px-8 pt-8 max-w-[1400px] mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-outfit">Analytics & Performance</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor your restaurant's key metrics and sales trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-4 px-4 py-2 bg-slate-950 text-slate-50 rounded-[8px] text-sm font-semibold hover:bg-slate-900 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export Report (CSV)
                    </button>
                </div>
            </div>

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
    );
};