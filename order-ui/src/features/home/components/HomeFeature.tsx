import { HomeHeader } from "./HomeHeader";
import { QuickActions } from "./QuickActions";
import { TodaySnapshot } from "./TodaySnapshot";
import { KitchenBacklog } from "./KitchenBacklog";
import { LowStockAlerts } from "./LowStockAlerts";

export function HomeFeature() {
    return (
        <div
            className="min-h-full"
            style={{ fontFamily: "'Outfit', sans-serif" }}
        >
            {/* Background pattern */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage:
                        "radial-gradient(#0f172a 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    opacity: 0.03,
                }}
            />

            {/* Page container */}
            <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 space-y-6">
                <HomeHeader />
                <QuickActions />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                    <div className="space-y-5">
                        <TodaySnapshot />
                    </div>

                    <div className="space-y-5">
                        <KitchenBacklog />
                        <LowStockAlerts />
                    </div>
                </div>
            </div>
        </div>
    );
}