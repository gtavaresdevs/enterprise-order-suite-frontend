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
  },
} as const;

function detectDefaultLanguage(): "en" | "pt-BR" {
  const saved = window.localStorage.getItem("preferences");
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { language?: string };
      if (parsed.language === "English") return "en";
      if (parsed.language === "Português (Brasil)") return "pt-BR";
    } catch {
      // fall through to navigator detection
    }
  }
  return navigator.language.startsWith("en") ? "en" : "pt-BR";
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
