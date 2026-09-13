export function StatusPill({ active }: { active: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-xs font-medium tracking-wide ${
                active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
            {active ? "Active" : "Inactive"}
        </span>
    );
}
