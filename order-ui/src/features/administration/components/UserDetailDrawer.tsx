import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Mail, Shield } from "lucide-react";
import { teamService } from "@/features/administration/services/team.service";
import { useTeam } from "@/features/administration/hooks/useTeam";
import { useRoles } from "@/features/administration/hooks/useRoles";
import { StatusPill } from "./StatusPill";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { UserDetail, RoleOption } from "@/types/administration";

export function UserDetailDrawer({ userId, onClose }: { userId: number; onClose: () => void }) {
    const { data: user, isLoading } = useQuery({
        queryKey: ["users", "detail", userId],
        queryFn: () => teamService.getUser(userId),
    });
    const { roles, isError: rolesError } = useRoles();
    const {
        update,
        isUpdating,
        setRole,
        isSettingRole,
        deactivate,
        isDeactivating,
        reactivate,
        isReactivating,
        resendSetup,
        isResendingSetup,
    } = useTeam(0);

    if (isLoading || !user) {
        return (
            <>
                <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" onClick={onClose} />
                <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl flex items-center justify-center">
                    <p className="text-sm text-slate-400 font-mono animate-pulse">Loading user...</p>
                </div>
            </>
        );
    }

    return (
        <UserDetailContent
            key={userId}
            user={user}
            userId={userId}
            roles={roles}
            rolesError={rolesError}
            onClose={onClose}
            update={update}
            isUpdating={isUpdating}
            setRole={setRole}
            isSettingRole={isSettingRole}
            deactivate={deactivate}
            isDeactivating={isDeactivating}
            reactivate={reactivate}
            isReactivating={isReactivating}
            resendSetup={resendSetup}
            isResendingSetup={isResendingSetup}
        />
    );
}

interface UserDetailContentProps {
    user: UserDetail;
    userId: number;
    roles: RoleOption[];
    rolesError: boolean;
    onClose: () => void;
    update: ReturnType<typeof useTeam>["update"];
    isUpdating: boolean;
    setRole: ReturnType<typeof useTeam>["setRole"];
    isSettingRole: boolean;
    deactivate: ReturnType<typeof useTeam>["deactivate"];
    isDeactivating: boolean;
    reactivate: ReturnType<typeof useTeam>["reactivate"];
    isReactivating: boolean;
    resendSetup: ReturnType<typeof useTeam>["resendSetup"];
    isResendingSetup: boolean;
}

// Mounted only once `user` is available, so local form state can be seeded
// straight from props via lazy initializers — no effect-driven sync needed.
function UserDetailContent({
    user,
    userId,
    roles,
    rolesError,
    onClose,
    update,
    isUpdating,
    setRole,
    isSettingRole,
    deactivate,
    isDeactivating,
    reactivate,
    isReactivating,
    resendSetup,
    isResendingSetup,
}: UserDetailContentProps) {
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email);
    const [saveError, setSaveError] = useState("");
    const [roleError, setRoleError] = useState("");

    async function handleSave() {
        setSaveError("");
        try {
            await update({ id: userId, request: { email, firstName, lastName } });
        } catch {
            setSaveError("Couldn't save changes. Check the email isn't already in use.");
        }
    }

    async function handleRoleChange(role: string) {
        setRoleError("");
        try {
            await setRole({ id: userId, request: { role } });
        } catch {
            setRoleError("Couldn't update the role.");
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl shadow-slate-900/20 flex flex-col border-l border-slate-200">
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{user.firstName} {user.lastName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusPill active={user.active} />
                            <span className="text-xs text-slate-400 font-mono">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-8 h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">First name</Label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Last name</Label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isUpdating || !email.trim()}
                        className="h-9 rounded-[8px] bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800"
                    >
                        {isUpdating ? "Saving..." : "Save changes"}
                    </Button>
                    {saveError && <p className="text-xs text-red-600">{saveError}</p>}

                    <div className="h-px bg-slate-100" />

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> Role
                        </Label>
                        <Select
                            value={user.role}
                            onValueChange={handleRoleChange}
                            disabled={isSettingRole}
                        >
                            <SelectTrigger className="h-9 rounded-[8px] bg-slate-50 border-slate-200">
                                <SelectValue placeholder={user.role} />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {rolesError && (
                            <p className="text-xs text-amber-600">Couldn't load role options.</p>
                        )}
                        {roleError && <p className="text-xs text-red-600">{roleError}</p>}
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="flex flex-col gap-2">
                        {user.active ? (
                            <Button
                                variant="outline"
                                onClick={() => deactivate(userId)}
                                disabled={isDeactivating}
                                className="h-9 rounded-[8px] border-red-200 text-red-600 hover:bg-red-50"
                            >
                                {isDeactivating ? "Deactivating..." : "Deactivate"}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => reactivate(userId)}
                                disabled={isReactivating}
                                className="h-9 rounded-[8px] border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            >
                                {isReactivating ? "Reactivating..." : "Reactivate"}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => resendSetup(userId)}
                            disabled={isResendingSetup}
                            className="h-9 rounded-[8px] border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                            {isResendingSetup ? "Sending..." : "Resend password setup email"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
