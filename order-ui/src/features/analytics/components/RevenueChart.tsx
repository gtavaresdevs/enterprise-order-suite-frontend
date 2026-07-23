import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { REVENUE_CHART_CONFIG } from "../constants/analytics.constants";
import type { RevenueData } from "@/types/analytics";

interface RevenueChartProps {
    data: RevenueData[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={REVENUE_CHART_CONFIG.margin}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={REVENUE_CHART_CONFIG.xAxisTick} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={REVENUE_CHART_CONFIG.yAxisTick} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'DM Mono', fontSize: '14px' }}
                        formatter={(value: any) => [`$${value}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};