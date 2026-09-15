import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { PackageX, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHomeData } from "../hooks/useHomeData";

export function LowStockAlerts() {
    const { t } = useTranslation("home");
    const navigate = useNavigate();
    const { lowStockItems, isLoading } = useHomeData();

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    {t("lowStock.title")}
                </h2>
                {!isLoading && lowStockItems.length > 0 && (
                    <span className="text-xs text-slate-400 font-mono">
                        {t("lowStock.itemCount", { count: lowStockItems.length })}
                    </span>
                )}
            </div>

            <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                <CardContent className="p-4">
                    {isLoading ? (
                        <p className="text-sm text-slate-400 font-mono animate-pulse py-4 text-center">{t("lowStock.loading")}</p>
                    ) : lowStockItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            <p className="text-sm text-slate-400">{t("lowStock.empty")}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {lowStockItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <PackageX className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-700 truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-mono font-semibold text-amber-600 flex-shrink-0">
                                        {t("lowStock.stockLeft", { count: item.stockQuantity })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={() => navigate("/menu")}
                        variant="outline"
                        className="w-full h-9 mt-4 rounded-[8px] border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                        {t("lowStock.manageButton")}
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
