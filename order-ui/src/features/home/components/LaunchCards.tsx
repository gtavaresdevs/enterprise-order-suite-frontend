import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Store, ChefHat, UtensilsCrossed, Copy, Check, ExternalLink, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LaunchCardsProps {
    kitchenBacklogCount?: number;
    lowStockCount?: number;
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500";

export function LaunchCards({ kitchenBacklogCount, lowStockCount }: LaunchCardsProps) {
    const { t } = useTranslation("home");
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/storefront`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard permission denied by the browser — nothing to recover here.
        }
    };

    return (
        <section aria-label={t("launch.title")} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Storefront: two different actions (open / copy), so it is a div, not a single link. */}
            <Card className="bg-white border border-blue-100 rounded-[8px] shadow-none">
                <CardContent className="p-5 flex flex-col justify-between gap-5 h-full">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">{t("launch.storefront.title")}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{t("launch.storefront.description")}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href="/storefront"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 h-9 inline-flex items-center justify-center gap-2 rounded-[8px] bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all ${focus}`}
                        >
                            {t("launch.storefront.open")}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            type="button"
                            onClick={copyLink}
                            aria-label={copied ? t("launch.storefront.copied") : t("launch.storefront.copy")}
                            title={copied ? t("launch.storefront.copied") : t("launch.storefront.copy")}
                            className={`h-9 w-9 inline-flex items-center justify-center rounded-[8px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors ${focus}`}
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </CardContent>
            </Card>

            <Link to="/kds" className={`group block rounded-[8px] ${focus}`}>
                <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none h-full group-hover:border-amber-200 transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between gap-5 h-full">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                                    <ChefHat className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">{t("launch.kds.title")}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{t("launch.kds.description")}</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-sm text-slate-700">
                            <span className="text-2xl font-semibold tabular-nums text-slate-900 mr-2">{kitchenBacklogCount ?? "–"}</span>
                            {t("launch.kds.queue", { count: kitchenBacklogCount ?? 0 })}
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Link to="/menu" className={`group block rounded-[8px] ${focus}`}>
                <Card className="bg-white border border-slate-100 rounded-[8px] shadow-none h-full group-hover:border-emerald-200 transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between gap-5 h-full">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <UtensilsCrossed className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">{t("launch.menu.title")}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{t("launch.menu.description")}</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-sm text-slate-700">
                            {lowStockCount ? (
                                <>
                                    <span className="text-2xl font-semibold tabular-nums text-amber-600 mr-2">{lowStockCount}</span>
                                    {t("launch.menu.lowStock", { count: lowStockCount })}
                                </>
                            ) : (
                                t("launch.menu.stocked")
                            )}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </section>
    );
}
