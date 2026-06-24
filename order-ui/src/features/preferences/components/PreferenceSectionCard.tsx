import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface PreferenceSectionCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}

export function PreferenceSectionCard({
    icon: Icon,
    title,
    description,
    children,
}: PreferenceSectionCardProps) {
    return (
        <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-4 flex flex-row items-center gap-3 space-y-0">
                <div className="w-8 h-8 rounded-[8px] bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
            </CardHeader>

            {/* Delegating all internal padding purely to CardContent and utilizing Flex layout */}
            <CardContent className="p-5 flex flex-col gap-5">
                {children}
            </CardContent>
        </Card>
    );
}