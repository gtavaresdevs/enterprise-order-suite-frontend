import { User, Mail, Briefcase, Building2, Phone, MapPin, Save, CheckCircle2 } from "lucide-react";
import type { UserProfileForm } from "@/types/profile";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProfileField } from "@/features/profile/components/ProfileField";

interface ProfilePersonalInfoCardProps {
    form: UserProfileForm;
    isSaved: boolean;
    onUpdate: <K extends keyof UserProfileForm>(key: K, value: UserProfileForm[K]) => void;
    onSave: () => void;
}

export function ProfilePersonalInfoCard({
    form,
    isSaved,
    onUpdate,
    onSave,
}: ProfilePersonalInfoCardProps) {
    return (
        <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-6 py-4 space-y-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Personal Information
                </p>
            </CardHeader>

            <CardContent className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField
                        label="Full Name"
                        icon={User}
                        value={form.name}
                        onChange={(v) => onUpdate("name", v)}
                        placeholder="Full name"
                    />
                    <ProfileField
                        label="Email Address"
                        icon={Mail}
                        value={form.email}
                        onChange={(v) => onUpdate("email", v)}
                        type="email"
                        placeholder="email@company.com"
                    />
                    <ProfileField
                        label="Job Title / Role"
                        icon={Briefcase}
                        value={form.role}
                        onChange={(v) => onUpdate("role", v)}
                        placeholder="e.g. Operations Director"
                    />
                    <ProfileField
                        label="Department"
                        icon={Building2}
                        value={form.department}
                        onChange={(v) => onUpdate("department", v)}
                        placeholder="e.g. Supply Chain"
                    />
                    <ProfileField
                        label="Phone"
                        icon={Phone}
                        value={form.phone}
                        onChange={(v) => onUpdate("phone", v)}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                    />
                    <ProfileField
                        label="Location"
                        icon={MapPin}
                        value={form.location}
                        onChange={(v) => onUpdate("location", v)}
                        placeholder="City, Country"
                    />
                </div>

                <ProfileField label="Bio" isTextarea>
                    <Textarea
                        className="w-full px-3 py-2.5 rounded-[8px] bg-slate-50 border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-slate-950/10 focus-visible:border-slate-400 transition-all resize-none shadow-none"
                        rows={3}
                        value={form.bio}
                        onChange={(e) => onUpdate("bio", e.target.value)}
                        placeholder="Short professional bio..."
                    />
                </ProfileField>
            </CardContent>

            <CardFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <p className="text-xs text-slate-400">Last saved automatically · Nov 20, 2024</p>
                <Button
                    onClick={onSave}
                    className={`gap-2 h-9 px-5 rounded-[8px] text-sm font-semibold border shadow-inner transition-all active:scale-[0.98] ${isSaved
                            ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                            : "bg-slate-950 text-slate-50 border-slate-800 hover:bg-slate-800"
                        }`}
                >
                    {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaved ? "Saved!" : "Save Changes"}
                </Button>
            </CardFooter>
        </Card>
    );
}