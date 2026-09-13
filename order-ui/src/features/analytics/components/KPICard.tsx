import type { AnalyticsKPI } from "@/types/analytics";

interface KPICardProps {
    data: AnalyticsKPI;
}

export const KPICard = ({ data }: KPICardProps) => {
    const Icon = data.icon;

    return (
        <div className="bg-white p-5 rounded-[8px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="w-8 h-8 rounded-[8px] bg-slate-50 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{data.label}</p>
                <p className="text-2xl font-semibold text-slate-900 font-mono">{data.value}</p>
            </div>
        </div>
    );
};