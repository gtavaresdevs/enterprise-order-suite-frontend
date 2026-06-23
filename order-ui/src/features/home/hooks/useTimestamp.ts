import { useState, useEffect } from "react";

export function useTimestamp() {
  const [ts, setTs] = useState(new Date());
  
  useEffect(() => {
    const t = setInterval(() => setTs(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  
  const hour = ts.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = ts.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const timeStr = ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  
  return { greeting, dateStr, timeStr };
}