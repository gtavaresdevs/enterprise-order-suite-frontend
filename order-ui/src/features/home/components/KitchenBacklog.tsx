import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Utensils, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHomeData } from "../hooks/useHomeData";

export function KitchenBacklog() {
    const { t } = useTranslation("home");
    const navigate = useNavigate();
    const { kitchenBacklogCount, isLoading } = useHomeData();

    return (
        <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                {t("kitchenBacklog.title")}
            </h2>

            <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[8px] bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Utensils className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-slate-900 font-mono">
                                {isLoading ? "-" : kitchenBacklogCount}
                            </p>
                            <p className="text-xs text-slate-400">
                                {t("kitchenBacklog.subtitle", { count: kitchenBacklogCount })}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate("/kds")}
                        variant="outline"
                        className="w-full h-9 rounded-[8px] border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                        {t("kitchenBacklog.viewButton")}
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
