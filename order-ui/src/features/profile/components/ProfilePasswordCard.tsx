import { Lock, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProfilePasswordCardProps {
    form: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
    isSaving: boolean;
    saved: boolean;
    error: string | null;
    isValid: boolean;
    onUpdate: <K extends "currentPassword" | "newPassword" | "confirmPassword">(
        field: K,
        value: string
    ) => void;
    onSubmit: () => void;
}

function PasswordInput({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {label}
            </Label>
            <div className="relative flex items-center w-full">
                <Lock className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                <Input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="h-9 rounded-[8px] bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-slate-950/10 focus-visible:border-slate-400 transition-all shadow-none pl-8 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                >
                    {visible ? (
                        <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                        <Eye className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}

export function ProfilePasswordCard({
    form,
    isSaving,
    saved,
    error,
    isValid,
    onUpdate,
    onSubmit,
}: ProfilePasswordCardProps) {
    return (
        <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-6 py-4 space-y-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Change Password
                </p>
            </CardHeader>

            <CardContent className="p-6 flex flex-col gap-5">
                <PasswordInput
                    label="Current Password"
                    value={form.currentPassword}
                    onChange={(v) => onUpdate("currentPassword", v)}
                    placeholder="Enter current password"
                />
                <PasswordInput
                    label="New Password"
                    value={form.newPassword}
                    onChange={(v) => onUpdate("newPassword", v)}
                    placeholder="Minimum 8 characters"
                />
                <PasswordInput
                    label="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(v) => onUpdate("confirmPassword", v)}
                    placeholder="Re-enter new password"
                />

                {error && (
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                )}

                {form.newPassword.length > 0 &&
                    form.confirmPassword.length > 0 &&
                    form.newPassword !== form.confirmPassword && (
                        <p className="text-xs text-amber-600 font-medium">
                            Passwords do not match
                        </p>
                    )}
            </CardContent>

            <CardFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end">
                <Button
                    onClick={onSubmit}
                    disabled={!isValid || isSaving}
                    className={`gap-2 h-9 px-5 rounded-[8px] text-sm font-semibold border shadow-inner transition-all active:scale-[0.98] ${saved
                            ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                            : "bg-slate-950 text-slate-50 border-slate-800 hover:bg-slate-800"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Updated!" : isSaving ? "Updating..." : "Update Password"}
                </Button>
            </CardFooter>
        </Card>
    );
}
