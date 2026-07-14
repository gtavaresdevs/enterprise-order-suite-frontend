import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import type { ChannelData } from "@/types/analytics";

interface SalesByChannelProps {
    data: ChannelData[];
}

export function SalesByChannel({ data }: SalesByChannelProps) {
    return (
        <div className="col-span-1 bg-white p-6 rounded-[8px] border border-slate-100 shadow-sm flex flex-col">
            <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900">Sales by Channel</h3>
                <p className="text-sm text-slate-500">Revenue breakdown by origin.</p>
            </div>
            <div className="flex-1 flex flex-col justify-center relative">
                <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                key="pie"
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                key="tooltip"
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Outfit', fontSize: '13px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    {data.map((channel) => (
                        <div key={channel.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channel.color }} />
                                <span className="text-slate-600 font-medium">{channel.name}</span>
                            </div>
                            <span className="font-mono text-slate-900 font-semibold">{channel.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}