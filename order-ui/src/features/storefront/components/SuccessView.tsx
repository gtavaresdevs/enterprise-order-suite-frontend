import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { Order } from "@/types/orders";

export const SuccessView = ({ order, onBack }: { order: Order | null; onBack: () => void }) => {
    const { t } = useTranslation("storefront");
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center pt-24 px-6 pb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-8">
                <Check className="w-12 h-12 stroke-[3]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center mb-2">{t("success.title")}</h1>
            <p className="text-slate-500 text-center text-[15px] mb-2">{t("success.subtitle")}</p>
            {order && (
                <p className="text-xs text-slate-400 font-mono text-center mb-6">
                    {t("success.orderIdLabel", { id: order.id })}
                    {order.etaMinutes != null && ` · ${t("success.etaLabel", { count: order.etaMinutes })}`}
                </p>
            )}

            <div className="w-full mt-auto flex flex-col gap-3">
                <button
                    disabled={!order}
                    onClick={() => order && navigate(`/track-order?order=${order.id}&phone=${encodeURIComponent(order.customerPhone)}`)}
                    className="w-full h-[52px] bg-slate-950 text-white rounded-[8px] font-semibold disabled:opacity-50"
                >
                    {t("success.trackOrderButton")}
                </button>
                <button onClick={onBack} className="w-full h-[52px] bg-transparent text-slate-600 rounded-[8px] font-semibold">{t("success.backToMenuButton")}</button>
            </div>
        </div>
    );
};
