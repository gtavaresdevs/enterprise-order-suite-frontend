import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import ptBrCommon from "./locales/pt-BR/common.json";

export const resources = {
  en: {
    common: enCommon,
  },
  "pt-BR": {
    common: ptBrCommon,
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
