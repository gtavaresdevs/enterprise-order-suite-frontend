import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useTimestamp() {
  const [ts, setTs] = useState(new Date());
  const { i18n } = useTranslation();

  useEffect(() => {
    const t = setInterval(() => setTs(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const locale = i18n.language === "pt-BR" ? "pt-BR" : "en-US";
  const hour = ts.getHours();
  const greetingPeriod: "morning" | "afternoon" | "evening" = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dateStr = ts.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });
  const timeStr = ts.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  return { greetingPeriod, dateStr, timeStr };
}