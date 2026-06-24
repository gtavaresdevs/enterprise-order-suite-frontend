export function NotificationsHeader() {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-400">
                Control which events trigger alerts across logistics, system, and account activity.
            </p>
        </div>
    );
}