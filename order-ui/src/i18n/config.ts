import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import ptBrCommon from "./locales/pt-BR/common.json";
import enShell from "./locales/en/shell.json";
import ptBrShell from "./locales/pt-BR/shell.json";
import enStorefront from "./locales/en/storefront.json";
import ptBrStorefront from "./locales/pt-BR/storefront.json";
import enTableMenu from "./locales/en/tableMenu.json";
import ptBrTableMenu from "./locales/pt-BR/tableMenu.json";
import enKds from "./locales/en/kds.json";
import ptBrKds from "./locales/pt-BR/kds.json";
import enOrders from "./locales/en/orders.json";
import ptBrOrders from "./locales/pt-BR/orders.json";
import enMenu from "./locales/en/menu.json";
import ptBrMenu from "./locales/pt-BR/menu.json";
import enTables from "./locales/en/tables.json";
import ptBrTables from "./locales/pt-BR/tables.json";
import enHome from "./locales/en/home.json";
import ptBrHome from "./locales/pt-BR/home.json";
import enAnalytics from "./locales/en/analytics.json";
import ptBrAnalytics from "./locales/pt-BR/analytics.json";
import enAdministration from "./locales/en/administration.json";
import ptBrAdministration from "./locales/pt-BR/administration.json";
import enNotifications from "./locales/en/notifications.json";
import ptBrNotifications from "./locales/pt-BR/notifications.json";
import enPreferences from "./locales/en/preferences.json";
import ptBrPreferences from "./locales/pt-BR/preferences.json";
import enPayment from "./locales/en/payment.json";
import ptBrPayment from "./locales/pt-BR/payment.json";
import enTrackOrder from "./locales/en/trackOrder.json";
import ptBrTrackOrder from "./locales/pt-BR/trackOrder.json";

export const resources = {
  en: {
    common: enCommon,
    shell: enShell,
    storefront: enStorefront,
    tableMenu: enTableMenu,
    kds: enKds,
    orders: enOrders,
    menu: enMenu,
    tables: enTables,
    home: enHome,
    analytics: enAnalytics,
    administration: enAdministration,
    notifications: enNotifications,
    preferences: enPreferences,
    payment: enPayment,
    trackOrder: enTrackOrder,
  },
  "pt-BR": {
    common: ptBrCommon,
    shell: ptBrShell,
    storefront: ptBrStorefront,
    tableMenu: ptBrTableMenu,
    kds: ptBrKds,
    orders: ptBrOrders,
    menu: ptBrMenu,
    tables: ptBrTables,
    home: ptBrHome,
    analytics: ptBrAnalytics,
    administration: ptBrAdministration,
    notifications: ptBrNotifications,
    preferences: ptBrPreferences,
    payment: ptBrPayment,
    trackOrder: ptBrTrackOrder,
  },
} as const;

/**
 * Resolves a saved `preferences.language` value (as stored in the Preferences
 * feature, e.g. "English" / "Português (Brasil)") to an i18next language code.
 * An unrecognized/legacy value (including one from before the language list
 * was collapsed to these 2 entries) falls back to browser-language detection.
 * Shared by i18next init below and by `PreferencesProvider` so the two can
 * never resolve a saved value differently.
 */
export function resolveLanguage(saved: string | undefined): "en" | "pt-BR" {
  if (saved === "English") return "en";
  if (saved === "Português (Brasil)") return "pt-BR";
  return navigator.language.startsWith("en") ? "en" : "pt-BR";
}

function detectDefaultLanguage(): "en" | "pt-BR" {
  const saved = window.localStorage.getItem("preferences");
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { language?: string };
      return resolveLanguage(parsed.language);
    } catch {
      // fall through to navigator detection
    }
  }
  return resolveLanguage(undefined);
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectDefaultLanguage(),
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
