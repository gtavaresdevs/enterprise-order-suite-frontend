import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTeam } from "@/features/administration/hooks/useTeam";
import { useRoles } from "@/features/administration/hooks/useRoles";

export function InviteUserModal({ onClose, onInvited }: { onClose: () => void; onInvited?: () => void }) {
    const { t } = useTranslation("administration");
    const { invite, isInviting } = useTeam(0);
    const { roles, isError: rolesError } = useRoles();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [sendPasswordSetupEmail, setSendPasswordSetupEmail] = useState(true);
    const [error, setError] = useState("");

    async function handleSubmit() {
        if (!email.trim() || !firstName.trim() || !lastName.trim()) {
            setError(t("inviteModal.requiredFieldsError"));
            return;
        }
        setError("");
        try {
            await invite({
                email: email.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                role: role || undefined,
                sendPasswordSetupEmail,
            });
            onInvited?.();
            onClose();
        } catch {
            setError(t("inviteModal.inviteError"));
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-sm bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-900">{t("inviteModal.title")}</h2>
                        <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("inviteModal.emailLabel")}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-8 h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("inviteModal.firstNameLabel")}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-8 h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("inviteModal.lastNameLabel")}</Label>
                                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 rounded-[8px] bg-slate-50 border-slate-200" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("inviteModal.roleLabel")}</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="h-9 rounded-[8px] bg-slate-50 border-slate-200">
                                    <SelectValue placeholder={t("inviteModal.rolePlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {rolesError && (
                                <p className="text-xs text-amber-600">{t("inviteModal.rolesLoadError")}</p>
                            )}
                        </div>
                        <label className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <Checkbox checked={sendPasswordSetupEmail} onCheckedChange={(v) => setSendPasswordSetupEmail(!!v)} />
                            {t("inviteModal.sendSetupEmailLabel")}
                        </label>
                        {error && <p className="text-xs text-red-600">{error}</p>}
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 rounded-b-[8px]">
                        <Button variant="outline" onClick={onClose} className="h-9 rounded-[8px] border-slate-200 text-slate-600 hover:bg-slate-100">
                            {t("inviteModal.cancelButton")}
                        </Button>
                        <Button onClick={handleSubmit} disabled={isInviting} className="h-9 rounded-[8px] bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800">
                            {isInviting ? t("inviteModal.invitingButton") : t("inviteModal.inviteButton")}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
