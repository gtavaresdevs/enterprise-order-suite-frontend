export function SettingsHeader() {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-400">
                Manage security, API access, sessions, and account-level controls.
            </p>
        </div>
    );
}