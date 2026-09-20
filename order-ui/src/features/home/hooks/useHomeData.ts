import { useQuery } from "@tanstack/react-query";
import { homeService } from "../services/home.service";

export function useHomeData() {
  const { data, isLoading } = useQuery({
    queryKey: ["home", "dashboard"],
    queryFn: homeService.getHomeDashboardData,
  });

  return { data, isLoading };
}
