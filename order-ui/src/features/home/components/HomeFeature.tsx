import { HomeHeader } from "./HomeHeader";
import { QuickActions } from "./QuickActions";
import { StatsOverview } from "./StatsOverview";
import { ChatAssistant } from "./ChatAssistant";

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
                {/* Top sections */}
                <HomeHeader />
                <QuickActions />

                {/* 2-column layout (FIXED SYSTEM) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                    {/* LEFT COLUMN */}
                    <div className="space-y-5">
                        <StatsOverview />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-5">
                        <ChatAssistant />
                    </div>

                </div>
            </div>
        </div>
    );
}