import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHomeData } from "../hooks/useHomeData";

export function StatsOverview() {
    const navigate = useNavigate();
    const { stats } = useHomeData();

    return (
        <section>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Overview Snapshot
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                    live · 1m refresh
                </span>
            </div>

            {/* Stats list */}
            <div className="flex flex-col gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card
                            key={stat.label}
                            className="bg-white border border-slate-100 rounded-[8px] shadow-none"
                        >
                            <CardContent className="p-4 flex items-center gap-4">

                                {/* Icon */}
                                <div
                                    className={`w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}
                                >
                                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                                        {stat.label}
                                    </p>

                                    <p
                                        className={`text-base font-semibold text-slate-900 truncate ${stat.mono ? "font-mono text-sm" : ""
                                            }`}
                                    >
                                        {stat.value}
                                    </p>

                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                        {stat.sub}
                                    </p>
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}

                {/* CTA */}
                <Button
                    onClick={() => navigate("/orders")}
                    className="w-full h-auto rounded-[8px] bg-slate-950 text-slate-50 px-4 py-3 flex items-center justify-between border border-slate-800 shadow-inner hover:bg-slate-800 transition-all group"
                >
                    <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-50">
                            Go to Order Operations
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                            Manage all active fulfillment
                        </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </Button>
            </div>
        </section>
    );
}