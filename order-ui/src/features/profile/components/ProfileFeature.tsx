import { useProfile } from "@/features/profile/hooks/useProfile";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileAvatarCard } from "@/features/profile/components/ProfileAvatarCard";
import { ProfileAccountInfoCard } from "@/features/profile/components/ProfileAccountInfoCard";
import { ProfilePersonalInfoCard } from "@/features/profile/components/ProfilePersonalInfoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function ProfileFeature() {
    const profile = useProfile();

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[960px] mx-auto px-6 py-8 flex flex-col gap-8">
                <ProfileHeader />

                {profile.fetchError && (
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{profile.fetchError}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={profile.refetch}
                            className="border-red-200 text-red-700 hover:bg-red-100 gap-1.5 h-8 text-xs"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Retry
                        </Button>
                    </div>
                )}

                {profile.isLoading ? (
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-4">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-48 w-full rounded-xl" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
                            <Skeleton className="h-96 w-full rounded-xl" />
                        </div>
                    </div>
                ) : (
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
                            <ProfileAccountInfoCard
                                createdAt={profile.form.createdAt}
                                userId={profile.form.id}
                                role={profile.form.role}
                            />
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-6">
                            <ProfilePersonalInfoCard
                                form={profile.form}
                                isDirty={profile.isDirty}
                                isSaving={profile.isSaving}
                                isSaved={profile.saved}
                                error={profile.saveError}
                                lastUpdated={profile.lastUpdated}
                                onUpdate={profile.updateField}
                                onSave={profile.saveProfile}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}