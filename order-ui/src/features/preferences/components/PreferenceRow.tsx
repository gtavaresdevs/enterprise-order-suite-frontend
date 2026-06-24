import { Label } from "@/components/ui/label";

interface PreferenceRowProps {
    label: string;
    sub?: string;
    children: React.ReactNode;
}

export function PreferenceRow({ label, sub, children }: PreferenceRowProps) {
    return (
        <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <Label className="text-sm font-medium text-slate-700">{label}</Label>
                {sub && <p className="text-xs text-slate-400">{sub}</p>}
            </div>
            <div className="flex-shrink-0">
                {children}
            </div>
        </div>
    );
}