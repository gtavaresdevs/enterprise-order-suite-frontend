import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { AnalyticsKPI } from "@/types/analytics";

interface KPICardProps {
    data: AnalyticsKPI;
}

export const KPICard = ({ data }: KPICardProps) => {
    const Icon = data.icon;

    return (
        <div className="bg-white p-5 rounded-[8px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-[8px] bg-slate-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <Badge variant="outline" className={`px-2 py-0.5 rounded-[8px] text-xs font-medium flex items-center gap-1 ${data.isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {data.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {data.trend}
                </Badge>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{data.label}</p>
                <p className="text-2xl font-semibold text-slate-900 font-mono">{data.value}</p>
            </div>
        </div>
    );
};