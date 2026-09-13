import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuditLog } from "@/features/administration/hooks/useAuditLog";
import { Pagination } from "./Pagination";
import { AdministrationHeader } from "./AdministrationHeader";

export function AuditLogFeature() {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError } = useAuditLog(page);

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />
            <div className="relative z-10 max-w-[900px] mx-auto px-6 py-8 flex flex-col gap-6">
                <AdministrationHeader
                    title="Audit Log"
                    description="Who did what to whom, and when — identity and access changes."
                />

                <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr] gap-4 items-center px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                        {["Event", "Actor", "Target", "When"].map((col) => (
                            <span key={col} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{col}</span>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400 font-mono animate-pulse">Loading audit log...</p>
                        </div>
                    ) : isError ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400">Couldn't load the audit log.</p>
                        </div>
                    ) : data && data.items.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <ScrollText className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-400">No audit events yet.</p>
                        </div>
                    ) : (
                        data?.items.map((event) => (
                            <div key={event.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr] gap-4 items-center px-5 py-3.5 border-b border-slate-50 last:border-b-0">
                                <span className="text-sm font-medium text-slate-800">{event.type}</span>
                                <span className="text-xs font-mono text-slate-500">#{event.actorUserId}</span>
                                <span className="text-xs font-mono text-slate-500">{event.targetUserId ? `#${event.targetUserId}` : "—"}</span>
                                <span className="text-xs text-slate-400 font-mono">{new Date(event.createdAt).toLocaleString()}</span>
                            </div>
                        ))
                    )}

                    {data && (
                        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
                    )}
                </div>
            </div>
        </div>
    );
}
