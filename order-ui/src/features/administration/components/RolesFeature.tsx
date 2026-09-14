import { KeySquare } from "lucide-react";
import { useRoles } from "@/features/administration/hooks/useRoles";
import { AdministrationHeader } from "./AdministrationHeader";

export function RolesFeature() {
    const { roles, isLoading } = useRoles();

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.03 }} />
            <div className="relative z-10 max-w-[700px] mx-auto px-6 py-8 flex flex-col gap-6">
                <AdministrationHeader
                    title="Roles"
                    description="Reference list of roles available in your organization."
                />
                <p className="text-xs text-slate-400 -mt-4">
                    Read-only — the backend currently exposes role names only, not custom permission sets.
                </p>

                <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="py-16 flex justify-center">
                            <p className="text-sm text-slate-400 font-mono animate-pulse">Loading roles...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <KeySquare className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-400">No roles found.</p>
                        </div>
                    ) : (
                        roles.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-b-0">
                                <div className="w-8 h-8 rounded-[8px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <KeySquare className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm font-medium text-slate-800">{r.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
