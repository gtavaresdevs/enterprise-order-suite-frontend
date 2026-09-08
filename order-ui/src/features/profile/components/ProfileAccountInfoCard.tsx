import { Clock, Star, Shield, Hash } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfileAccountInfoCardProps {
    createdAt?: string;
    userId?: number;
    role?: string;
}

function formatMemberSince(dateStr?: string): string {
    if (!dateStr) return "Active Member";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export function ProfileAccountInfoCard({
    createdAt,
    userId,
    role = "Enterprise",
}: ProfileAccountInfoCardProps) {
    const stats = [
        {
            icon: Clock,
            label: "Member Since",
            value: formatMemberSince(createdAt),
            mono: false,
        },
        {
            icon: Star,
            label: "Account Tier",
            value: role.replace(/^ROLE_/i, ""),
            mono: false,
        },
        {
            icon: Shield,
            label: "Security",
            value: "2FA Enabled",
            mono: false,
        },
        {
            icon: Hash,
            label: "User ID",
            value: userId ? `USR-${String(userId).padStart(5, "0")}` : "USR-00001",
            mono: true,
        },
    ];

    return (
        <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-4 py-3 space-y-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Account Info
                </p>
            </CardHeader>
            <CardContent className="p-0 flex flex-col">
                {stats.map(({ icon: Icon, label, value, mono }, index) => (
                    <div key={label} className="flex flex-col">
                        {index > 0 && <Separator className="bg-slate-50" />}
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-500">{label}</span>
                            </div>
                            <span
                                className={`text-xs font-semibold text-slate-700 ${
                                    mono ? "font-mono" : ""
                                }`}
                            >
                                {value}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}