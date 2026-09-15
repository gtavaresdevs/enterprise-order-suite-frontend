import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNotificationFeed } from "@/features/notifications/hooks/useNotificationFeed";

export function NotificationBell() {
  const { t } = useTranslation("shell");
  const { notifications, unreadCount } = useNotificationFeed();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative w-9 h-9 rounded-[8px] border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 rounded-[8px] border border-slate-200 shadow-lg shadow-slate-900/10 p-0 overflow-hidden"
      >
        <div className="px-3 py-2.5 bg-white flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">{t("notificationBell.title")}</p>
          {unreadCount > 0 && (
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
              {t("notificationBell.newCount", { count: unreadCount })}
            </span>
          )}
        </div>

        <DropdownMenuSeparator className="m-0 bg-slate-100" />

        <div className="max-h-80 overflow-y-auto py-1 bg-white">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50">
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  n.read ? "bg-transparent" : "bg-blue-500"
                }`}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{n.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{n.description}</p>
                <p className="text-[10px] text-slate-300 mt-1">{n.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
