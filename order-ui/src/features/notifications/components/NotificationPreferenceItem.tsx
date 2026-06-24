import type { NotificationItem } from "@/types/notifications";
import { Switch } from "@/components/ui/switch";

interface NotificationPreferenceItemProps {
    item: NotificationItem;
    isOn: boolean;
    globalMute: boolean;
    onToggle: (value: boolean) => void;
}

export function NotificationPreferenceItem({
    item,
    isOn,
    globalMute,
    onToggle,
}: NotificationPreferenceItemProps) {
    const Icon = item.icon;

    return (
        <div className={`flex items-start justify-between gap-4 transition-opacity ${globalMute ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors ${isOn ? "bg-slate-100" : "bg-slate-50"}`}>
                    <Icon className={`w-4 h-4 transition-colors ${isOn ? "text-slate-600" : "text-slate-300"}`} />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-colors ${isOn ? "text-slate-800" : "text-slate-400"}`}>
                        {item.label}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </div>
            <Switch
                checked={isOn}
                onCheckedChange={onToggle}
                disabled={globalMute}
            />
        </div>
    );
}