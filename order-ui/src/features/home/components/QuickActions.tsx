import { useNavigate } from "react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHomeData } from "../hooks/useHomeData";

export function QuickActions() {
    const navigate = useNavigate();
    const { actions } = useHomeData();

    return (
        <section className="space-y-4">

            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Quick Actions
                </h2>

                <span className="text-xs text-slate-400 font-mono">
                    {actions.length} pathways
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {actions.map((card) => {
                    const Icon = card.icon;
                    const isRouted = !!card.to;

                    return (
                        <Card
                            key={card.label}
                            onClick={() => isRouted && navigate(card.to as string)}
                            className={`group text-left rounded-[8px] border border-slate-100 bg-white shadow-none hover:shadow-md hover:shadow-slate-900/5 transition-all h-full ${card.accent
                                } ${isRouted
                                    ? "cursor-pointer"
                                    : "opacity-70 cursor-default"
                                }`}
                        >
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-4">

                                <div className="flex items-start justify-between">
                                    <div
                                        className={`w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {card.badge ? (
                                        <Badge
                                            variant="secondary"
                                            className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[8px] font-mono border-none"
                                        >
                                            {card.badge}
                                        </Badge>
                                    ) : isRouted ? (
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                    ) : null}
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                                        {card.label}
                                    </h3>

                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>

                                {isRouted && (
                                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                        Navigate <ChevronRight className="w-3 h-3" />
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}