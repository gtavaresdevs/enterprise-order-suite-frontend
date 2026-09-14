import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import { LOCALE_BY_LANGUAGE, TRANSLATIONS } from "@/i18n/translations";

export function useTranslation() {
    const { preferences } = usePreferencesContext();
    const locale = LOCALE_BY_LANGUAGE[preferences.language];

    const t = (key: string): string => {
        if (!locale) return key;
        return TRANSLATIONS[key]?.[locale] ?? key;
    };

    return { t };
}
