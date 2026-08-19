import { useProfile } from "@/features/profile/hooks/useProfile";
import { useChangePassword } from "@/features/profile/hooks/useChangePassword";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileAvatarCard } from "@/features/profile/components/ProfileAvatarCard";
import { ProfileAccountInfoCard } from "@/features/profile/components/ProfileAccountInfoCard";
import { ProfilePersonalInfoCard } from "@/features/profile/components/ProfilePersonalInfoCard";
import { ProfilePasswordCard } from "@/features/profile/components/ProfilePasswordCard";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function ProfileFeature() {
    const profile = useProfile();
    const password = useChangePassword();

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[960px] mx-auto px-6 py-8 flex flex-col gap-8">

                <ProfileHeader />

                {/* Replaced grid-cols-[280px_1fr] with a compliant Flexbox structure */}
                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Left Sidebar */}
                    <div className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-4">
                        <ProfileAvatarCard
                            firstName={profile.form.firstName}
                            lastName={profile.form.lastName}
                            role={profile.form.role}
                            avatarSrc={profile.avatarSrc}
                            fileInputRef={profile.fileInputRef}
                            onTriggerUpload={profile.triggerFileInput}
                            onUpload={profile.handleAvatarUpload}
                        />
                        <ProfileAccountInfoCard />
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-6">
                        <ProfilePersonalInfoCard
                            form={profile.form}
                            isDirty={profile.isDirty}
                            isSaving={profile.isSaving}
                            isSaved={profile.saved}
                            lastUpdated={profile.lastUpdated}
                            onUpdate={profile.updateField}
                            onSave={profile.saveProfile}
                        />
                        <ProfilePasswordCard
                            form={password.form}
                            isSaving={password.isSaving}
                            saved={password.saved}
                            error={password.error}
                            isValid={password.isValid}
                            onUpdate={password.updateField}
                            onSubmit={password.submit}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}