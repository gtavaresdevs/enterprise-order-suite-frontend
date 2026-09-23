import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import { formatCurrency, formatDate, getCurrencySymbol } from "@/utils/format";

export function useFormat() {
    const { preferences } = usePreferencesContext();

    return {
        formatCurrency: (value: number) => formatCurrency(value, preferences.currency, preferences.language),
        formatDate: (iso: string) => formatDate(iso, preferences.dateFormat, preferences.timezone),
        currencySymbol: getCurrencySymbol(preferences.currency, preferences.language),
    };
}
