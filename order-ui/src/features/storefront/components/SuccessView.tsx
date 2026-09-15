import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

export const SuccessView = ({ onBack }: { onBack: () => void }) => {
    const { t } = useTranslation("storefront");
    return (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center pt-24 px-6 pb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-8">
                <Check className="w-12 h-12 stroke-[3]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center mb-2">{t("success.title")}</h1>
            <p className="text-slate-500 text-center text-[15px] mb-10">{t("success.subtitle")}</p>

            <div className="w-full mt-auto flex flex-col gap-3">
                <button className="w-full h-[52px] bg-slate-950 text-white rounded-[8px] font-semibold">{t("success.trackOrderButton")}</button>
                <button onClick={onBack} className="w-full h-[52px] bg-transparent text-slate-600 rounded-[8px] font-semibold">{t("success.backToMenuButton")}</button>
            </div>
        </div>
    );
};