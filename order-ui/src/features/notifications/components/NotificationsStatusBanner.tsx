import { useTranslation } from "react-i18next";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationsStatusBannerProps {
    globalMute: boolean;
    activeCount: number;
    totalCount: number;
    onToggleMute: (mute: boolean) => void;
}

export function NotificationsStatusBanner({
    globalMute,
    activeCount,
    totalCount,
    onToggleMute,
}: NotificationsStatusBannerProps) {
    const { t } = useTranslation("notifications");

    return (
        <Card className={globalMute ? "bg-slate-950 border-slate-800 text-slate-50" : "bg-white border-slate-100"}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {globalMute ? (
                        <BellOff className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    ) : (
                        <Bell className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                    <div className="flex flex-col gap-0.5">
                        <p className={`text-sm font-semibold ${globalMute ? "text-slate-50" : "text-slate-800"}`}>
                            {globalMute ? t("statusBanner.mutedTitle") : t("statusBanner.activeTitle")}
                        </p>
                        <p className={`text-xs ${globalMute ? "text-slate-400" : "text-slate-500"}`}>
                            {globalMute
                                ? t("statusBanner.mutedDescription")
                                : t("statusBanner.activeDescription", { active: activeCount, total: totalCount })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Label
                        htmlFor="global-mute-switch"
                        className={`text-xs font-medium cursor-pointer ${globalMute ? "text-slate-400" : "text-slate-500"}`}
                    >
                        {globalMute ? t("statusBanner.unmuteAll") : t("statusBanner.muteAll")}
                    </Label>
                    <Switch
                        id="global-mute-switch"
                        checked={!globalMute}
                        onCheckedChange={(checked) => onToggleMute(!checked)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}