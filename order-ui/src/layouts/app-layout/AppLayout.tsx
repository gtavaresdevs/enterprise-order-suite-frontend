import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarContent } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function AppLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">

            {/* ── Desktop Sidebar ── */}
            <Sidebar />

            {/* ── Mobile Sidebar (Drawer via ShadCN) ── */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-r-slate-800">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent onNavigate={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* ── Main Content Area ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

                {/* The router outlet layer manages scroll tracking for the primary view */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}