import { useTranslation } from "react-i18next";

export function NotificationsHeader() {
    const { t } = useTranslation("notifications");

    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-900">{t("header.title")}</h1>
            <p className="text-sm text-slate-400">
                {t("header.subtitle")}
            </p>
        </div>
    );
}