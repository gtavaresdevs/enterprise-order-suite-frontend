import { useState, useEffect } from "react";
import { homeService } from "../services/home.service";
import type { HomeData } from "@/types/home";
import { ACTION_CARDS, CHAT_MESSAGES, STATS } from "../constants/home.constants";

export function useHomeData() {
  // Using static constants as initial data to prevent layout shift before real APIs are added.
  // In a full TanStack setup, this wraps `useQuery`
  const [data, setData] = useState<HomeData>({
    actions: ACTION_CARDS,
    stats: STATS,
    chatMessages: CHAT_MESSAGES,
  });

  useEffect(() => {
    let mounted = true;
    homeService.getHomeDashboardData().then((res) => {
      if (mounted) setData(res);
    });
    return () => { mounted = false; };
  }, []);

  return data;
}