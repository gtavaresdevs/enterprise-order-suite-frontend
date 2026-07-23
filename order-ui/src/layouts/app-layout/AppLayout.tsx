import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarContent } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { GlobalHeader } from "./GlobalHeader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function AppLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>

            {/* ── Desktop Sidebar ── */}
            <Sidebar />

            {/* ── Mobile Sidebar (Drawer via ShadCN) ── */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="w-[220px] p-0 bg-white border-r-slate-100">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent onNavigate={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* ── Main Content Area ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
                <GlobalHeader />

                {/* The router outlet layer manages scroll tracking for the primary view */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}