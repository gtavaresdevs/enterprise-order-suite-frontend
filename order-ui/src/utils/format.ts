const LOCALE_MAP: Record<string, string> = {
    "English (US)": "en-US",
    "English (UK)": "en-GB",
    "Français": "fr-FR",
    "Deutsch": "de-DE",
    "日本語": "ja-JP",
    "한국어": "ko-KR",
    "中文 (简体)": "zh-CN",
    "Español": "es-ES",
};

const TIMEZONE_OFFSET_MINUTES: Record<string, number> = {
    "UTC-08:00 — Pacific Time (US)": -8 * 60,
    "UTC-05:00 — Eastern Time (US)": -5 * 60,
    "UTC+00:00 — Greenwich Mean Time": 0,
    "UTC+01:00 — Central European Time": 60,
    "UTC+05:30 — India Standard Time": 5 * 60 + 30,
    "UTC+08:00 — China Standard Time": 8 * 60,
    "UTC+09:00 — Japan Standard Time": 9 * 60,
    "UTC+10:00 — Australian Eastern Time": 10 * 60,
};

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatCurrency(value: number, currency: string, language: string): string {
    const code = currency.split(" — ")[0]?.trim() || "USD";
    const locale = LOCALE_MAP[language] ?? "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency: code, minimumFractionDigits: 2 }).format(value);
}

export function formatDate(iso: string, dateFormat: string, timezone: string): string {
    const offsetMinutes = TIMEZONE_OFFSET_MINUTES[timezone] ?? 0;
    const shifted = new Date(new Date(iso).getTime() + offsetMinutes * 60_000);

    const year = shifted.getUTCFullYear();
    const month = shifted.getUTCMonth();
    const day = shifted.getUTCDate();
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    switch (dateFormat) {
        case "DD/MM/YYYY":
            return `${dd}/${mm}/${year}`;
        case "YYYY-MM-DD":
            return `${year}-${mm}-${dd}`;
        case "D MMM YYYY":
            return `${day} ${MONTH_ABBR[month]} ${year}`;
        case "MM/DD/YYYY":
        default:
            return `${mm}/${dd}/${year}`;
    }
}
