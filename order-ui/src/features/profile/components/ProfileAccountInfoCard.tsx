import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { USER_STATS } from "@/features/profile/constants/profile.constants";

export function ProfileAccountInfoCard() {
    return (
        <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-4 py-3 space-y-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Account Info
                </p>
            </CardHeader>
            <CardContent className="p-0 flex flex-col">
                {USER_STATS.map(({ icon: Icon, label, value, mono }, index) => (
                    <div key={label} className="flex flex-col">
                        {index > 0 && <Separator className="bg-slate-50" />}
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-500">{label}</span>
                            </div>
                            <span className={`text-xs font-semibold text-slate-700 ${mono ? "font-mono" : ""}`}>
                                {value}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}