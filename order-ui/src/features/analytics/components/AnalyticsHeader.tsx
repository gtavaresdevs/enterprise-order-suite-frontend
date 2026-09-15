import { Calendar as CalendarIcon, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AnalyticsHeader() {
    const { t } = useTranslation("analytics");

    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{t("header.title")}</h1>
                <p className="text-sm text-slate-500 mt-1">{t("header.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-[8px] text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    {t("header.dateRangeButton")}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-slate-50 rounded-[8px] text-sm font-semibold hover:bg-slate-900 transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    {t("header.exportButton")}
                </button>
            </div>
        </div>
    );
}