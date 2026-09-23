import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { PackageX, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MenuItem } from "@/types/menu";

export function LowStockAlerts({ items }: { items: MenuItem[] }) {
    const { t } = useTranslation("home");

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">{t("lowStock.title")}</h2>
                {items.length > 0 && (
                    <span className="text-xs text-slate-400">{t("lowStock.itemCount", { count: items.length })}</span>
                )}
            </div>

            <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none">
                <CardContent className="p-2">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            <p className="text-sm text-slate-400">{t("lowStock.empty")}</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <Link
                                key={item.id}
                                to="/menu"
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[8px] hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-slate-500"
                            >
                                <span className="flex items-center gap-2.5 min-w-0">
                                    <PackageX className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 truncate">{item.name}</span>
                                </span>
                                <span className="text-xs font-semibold text-amber-600 tabular-nums flex-shrink-0">
                                    {t("lowStock.stockLeft", { count: item.stockQuantity })}
                                </span>
                            </Link>
                        ))
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
