import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronRight, Check, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ACTION_CARDS } from "../constants/home.constants";

// ACTION_CARDS entries are identified by their destination/copy target so their
// display copy can be looked up in the "home" i18n namespace without needing
// the mock constants file itself to carry translation keys.
const ACTION_TRANSLATION_KEY: Record<string, string> = {
    "/orders": "newOrder",
    "/kds": "openKds",
    "/menu": "viewMenu",
    "/storefront": "copyLink",
};

export function QuickActions() {
    const { t } = useTranslation("home");
    const navigate = useNavigate();
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

    const handleCopy = async (label: string, path: string) => {
        const url = `${window.location.origin}${path}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedLabel(label);
            setTimeout(() => setCopiedLabel((current) => (current === label ? null : current)), 2000);
        } catch {
            // Clipboard permission denied by the browser — nothing to recover here.
        }
    };

    return (
        <section className="space-y-4">

            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    {t("quickActions.title")}
                </h2>

                <span className="text-xs text-slate-400 font-mono">
                    {t("quickActions.pathwaysCount", { count: ACTION_CARDS.length })}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                {ACTION_CARDS.map((card) => {
                    const Icon = card.icon;
                    const isCopied = copiedLabel === card.label;
                    const actionKey = ACTION_TRANSLATION_KEY[card.to ?? card.copyValue ?? ""] ?? "newOrder";
                    const label = t(`quickActions.actions.${actionKey}.title`);
                    const description = t(`quickActions.actions.${actionKey}.description`);

                    return (
                        <Card
                            key={card.label}
                            onClick={() => (card.to ? navigate(card.to) : card.copyValue && handleCopy(card.label, card.copyValue))}
                            className={`group text-left rounded-[8px] border border-slate-100 bg-white shadow-none hover:shadow-md hover:shadow-slate-900/5 transition-all h-full cursor-pointer ${card.accent}`}
                        >
                            <CardContent className="p-4 flex flex-col justify-between h-full gap-4">

                                <div className="flex items-start justify-between">
                                    <div
                                        className={`w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {card.copyValue ? (
                                        isCopied ? (
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />
                                        )
                                    ) : (
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                                        {label}
                                    </h3>

                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                                    {card.copyValue ? (
                                        isCopied ? t("quickActions.copied") : t("quickActions.copyLinkAction")
                                    ) : (
                                        <>{t("quickActions.navigate")} <ChevronRight className="w-3 h-3" /></>
                                    )}
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}