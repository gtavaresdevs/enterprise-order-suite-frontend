import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { useTeam } from "@/features/administration/hooks/useTeam";
import { Pagination } from "./Pagination";
import { StatusPill } from "./StatusPill";
import { AdministrationHeader } from "./AdministrationHeader";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { InviteUserModal } from "./InviteUserModal";
import type { UserSummary } from "@/types/administration";

export function TeamFeature() {
    const [page, setPage] = useState(0);
    const { data, isLoading, isError } = useTeam(page);
    const [selected, setSelected] = useState<UserSummary | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />
            <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-8 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <AdministrationHeader
                        title="Team"
                        description="Manage user accounts, invitations, roles, and access."
                    />
                    <button
                        onClick={() => setInviteOpen(true)}
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-slate-950 text-slate-50 text-sm font-semibold border border-slate-800 shadow-inner hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" /> Invite User
                    </button>
                </div>

                <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.8fr] gap-4 items-center px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                        {["Email", "Role", "Status", "Created"].map((col) => (
                            <span key={col} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{col}</span>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400 font-mono animate-pulse">Loading team...</p>
                        </div>
                    ) : isError ? (
                        <div className="py-16 flex flex-col items-center gap-2">
                            <p className="text-sm text-slate-400">Couldn't load the team list.</p>
                        </div>
                    ) : data && data.items.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <Users className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-400">No users yet.</p>
                        </div>
                    ) : (
                        data?.items.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => setSelected(u)}
                                className="w-full grid grid-cols-[1.5fr_0.8fr_0.6fr_0.8fr] gap-4 items-center px-5 py-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors text-left"
                            >
                                <span className="text-sm text-slate-800 truncate">{u.email}</span>
                                <span className="text-xs font-mono text-slate-500">{u.role}</span>
                                <StatusPill active={u.active} />
                                <span className="text-xs text-slate-400 font-mono">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </span>
                            </button>
                        ))
                    )}

                    {data && (
                        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
                    )}
                </div>
            </div>

            {selected && <UserDetailDrawer userId={selected.id} onClose={() => setSelected(null)} />}
            {inviteOpen && (
                <InviteUserModal
                    onClose={() => setInviteOpen(false)}
                    onInvited={() => setPage(0)}
                />
            )}
        </div>
    );
}
