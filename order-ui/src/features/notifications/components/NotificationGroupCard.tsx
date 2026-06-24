import type { NotificationGroup } from "@/types/notifications";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NotificationPreferenceItem } from "@/features/notifications/components/NotificationPreferenceItem";

interface NotificationGroupCardProps {
    group: NotificationGroup;
    enabled: Record<string, boolean>;
    globalMute: boolean;
    isGroupOn: boolean;
    onToggleGroup: (value: boolean) => void;
    onToggleItem: (id: string, value: boolean) => void;
}

export function NotificationGroupCard({
    group,
    enabled,
    globalMute,
    isGroupOn,
    onToggleGroup,
    onToggleItem,
}: NotificationGroupCardProps) {
    const activeItemsCount = group.items.filter((i) => enabled[i.id]).length;

    return (
        <Card className="overflow-hidden border-slate-100">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[11px] font-bold uppercase tracking-widest rounded-[8px] border ${group.accent}`}>
                        {group.category}
                    </Badge>
                    <span className="font-mono text-[11px] text-slate-400">
                        {activeItemsCount}/{group.items.length} on
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-400 cursor-pointer">All</Label>
                    <Switch
                        checked={isGroupOn && !globalMute}
                        onCheckedChange={onToggleGroup}
                        disabled={globalMute}
                    />
                </div>
            </CardHeader>

            {/* Delegating all internal list padding purely to the parent CardContent and utilizing Flex/Gap layouts instead of fractional margin overrides */}
            <CardContent className="p-4 flex flex-col gap-4">
                {group.items.map((item, index) => (
                    <div key={item.id} className="flex flex-col gap-4">
                        {index > 0 && <Separator />}
                        <NotificationPreferenceItem
                            item={item}
                            isOn={enabled[item.id] && !globalMute}
                            globalMute={globalMute}
                            onToggle={(v) => onToggleItem(item.id, v)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}