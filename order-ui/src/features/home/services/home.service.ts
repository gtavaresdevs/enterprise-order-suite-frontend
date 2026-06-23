import { ACTION_CARDS, CHAT_MESSAGES, STATS } from "../constants/home.constants";
import type { HomeData } from "@/types/home";

export const homeService = {
  /**
   * Mock API fetch. Once a real backend exists, replace this with an Axios call
   * e.g., return axiosClient.get('/api/v1/home/dashboard')
   */
  getHomeDashboardData: async (): Promise<HomeData> => {
    // Simulating network delay for future TanStack Query transition
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          actions: ACTION_CARDS,
          stats: STATS,
          chatMessages: CHAT_MESSAGES,
        });
      }, 100);
    });
  },
};