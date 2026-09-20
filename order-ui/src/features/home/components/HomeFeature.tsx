import { useTranslation } from "react-i18next";
import { HomeHeader } from "./HomeHeader";
import { EarningsStrip } from "./EarningsStrip";
import { LaunchCards } from "./LaunchCards";
import { ActiveOrders } from "./ActiveOrders";
import { LowStockAlerts } from "./LowStockAlerts";
import { useHomeData } from "../hooks/useHomeData";

export function HomeFeature() {
    const { t } = useTranslation("home");
    const { data, isLoading } = useHomeData();

    return (
        <div className="min-h-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
                <HomeHeader />

                {data ? <EarningsStrip earnings={data.earnings} /> : (
                    <p className="text-sm text-slate-400 animate-pulse">{isLoading ? t("loading") : t("error")}</p>
                )}

                <LaunchCards
                    kitchenBacklogCount={data?.kitchenBacklogCount}
                    lowStockCount={data?.lowStockItems.length}
                />

                {data && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                        <ActiveOrders statusCounts={data.statusCounts} channelCounts={data.channelCounts} />
                        <LowStockAlerts items={data.lowStockItems} />
                    </div>
                )}
            </div>
        </div>
    );
}
