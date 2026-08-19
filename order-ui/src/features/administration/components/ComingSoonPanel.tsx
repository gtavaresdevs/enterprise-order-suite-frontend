import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { COMING_SOON_MESSAGE } from "@/features/administration/constants/administration.constants";
import type { AdministrationPageConfig } from "@/features/administration/types/administration.types";

interface ComingSoonPanelProps {
    page: AdministrationPageConfig;
    estimatedRelease?: string;
    isLoading?: boolean;
}

export function ComingSoonPanel({ page, estimatedRelease, isLoading }: ComingSoonPanelProps) {
    const Icon = page.icon;

    if (isLoading) {
        return (
            <Card className="border-slate-100 shadow-sm rounded-[8px]">
                <CardContent className="py-16 flex flex-col items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-[12px]" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-48" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-100 shadow-sm rounded-[8px] overflow-hidden">
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-slate-400" />
                </div>

                <Badge
                    variant="outline"
                    className="border-slate-200 bg-slate-50 text-slate-600 font-medium"
                >
                    <Construction className="w-3 h-3" />
                    Coming Soon
                </Badge>

                <div className="max-w-md flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-slate-700">{page.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{COMING_SOON_MESSAGE}</p>
                </div>

                {estimatedRelease && (
                    <p className="text-xs text-slate-400 font-mono">
                        Estimated release · {estimatedRelease}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
