import type { HeatmapData } from "@/types/analytics";

interface HeatmapProps {
    data: HeatmapData[];
}

export const Heatmap = ({ data }: HeatmapProps) => {
    return (
        <div className="flex-1 flex flex-col justify-end gap-3 pb-2">
            {data.map((slot) => (
                <div key={slot.time} className="flex items-center gap-3">
                    <span className="w-12 text-xs font-mono text-slate-500">{slot.time}</span>
                    <div className="flex-1 h-8 bg-slate-50 rounded-[4px] overflow-hidden">
                        <div
                            className="h-full bg-slate-900 transition-all rounded-[4px]"
                            style={{ width: `${slot.intensity}%`, opacity: slot.intensity / 100 }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};