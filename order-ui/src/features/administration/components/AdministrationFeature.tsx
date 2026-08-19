import { useAdministrationPage } from "@/features/administration/hooks/useAdministrationPage";
import { AdministrationHeader } from "@/features/administration/components/AdministrationHeader";
import { ComingSoonPanel } from "@/features/administration/components/ComingSoonPanel";
import type { AdministrationPageId } from "@/features/administration/types/administration.types";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

interface AdministrationFeatureProps {
    pageId: AdministrationPageId;
}

export function AdministrationFeature({ pageId }: AdministrationFeatureProps) {
    const { page, status, isLoading } = useAdministrationPage(pageId);

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[800px] mx-auto px-6 py-8 flex flex-col gap-8">
                <AdministrationHeader title={page.title} description={page.description} />
                <ComingSoonPanel
                    page={page}
                    estimatedRelease={status?.estimatedRelease}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
