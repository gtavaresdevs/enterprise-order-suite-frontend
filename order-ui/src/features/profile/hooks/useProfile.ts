import { useState, useCallback, useRef, useEffect } from "react";
import type { UserProfileForm, UpdateProfileRequest } from "@/types/profile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/profile/services/profile.service";

function formatDate(dateStr?: string): string {
    if (!dateStr) return "Recently";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function errorMessage(err: unknown, fallback: string): string {
    const e = err as { response?: { data?: { message?: string } }; message?: string } | null;
    return e?.response?.data?.message || e?.message || fallback;
}

export function useProfile() {
    const { user } = useAuth();

    const [form, setForm] = useState<UserProfileForm>({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        role: user?.roles?.[0] || "USER",
        department: "",
        phone: "",
        country: "",
        timezone: "",
        office: "",
        bio: "",
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
    const [stagedAvatarFile, setStagedAvatarFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Snapshot of the last-saved editable values for dirty comparison
    const [savedSnapshot, setSavedSnapshot] = useState<UpdateProfileRequest>({
        department: "",
        phone: "",
        country: "",
        timezone: "",
        office: "",
        bio: "",
    });

    // Loads the profile; state is only touched in the promise callbacks, so it's safe to call from an effect.
    const loadProfile = useCallback(() => profileService.getProfile()
        .then((data) => {
            const populatedForm: UserProfileForm = {
                id: data.id,
                firstName: data.firstName || user?.firstName || "",
                lastName: data.lastName || user?.lastName || "",
                email: data.email || user?.email || "",
                role: data.role || user?.roles?.[0] || "USER",
                department: data.department || "",
                phone: data.phone || "",
                country: data.country || "",
                timezone: data.timezone || "",
                office: data.office || "",
                bio: data.bio || "",
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };

            setForm(populatedForm);

            setFetchError(null);
            setSavedSnapshot({
                department: data.department || "",
                phone: data.phone || "",
                country: data.country || "",
                timezone: data.timezone || "",
                office: data.office || "",
                bio: data.bio || "",
            });
        })
        .catch((err) => {
            console.error("Failed to load profile:", err);
            setFetchError(errorMessage(err, "Failed to load profile from server."));
        })
        .finally(() => setIsLoading(false)), [user]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const fetchProfile = useCallback(() => {
        setIsLoading(true);
        setFetchError(null);
        return loadProfile();
    }, [loadProfile]);

    // Track dirty state by comparing editable fields to the saved snapshot
    const isDirty =
        form.department !== (savedSnapshot.department ?? "") ||
        form.phone !== (savedSnapshot.phone ?? "") ||
        form.country !== (savedSnapshot.country ?? "") ||
        form.timezone !== (savedSnapshot.timezone ?? "") ||
        form.office !== (savedSnapshot.office ?? "") ||
        form.bio !== (savedSnapshot.bio ?? "") ||
        stagedAvatarFile !== null;

    const updateField = useCallback(<K extends keyof UserProfileForm>(
        field: K,
        value: UserProfileForm[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaveError(null);
    }, []);

    const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatarSrc(url);
        setStagedAvatarFile(file);
    }, []);

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const saveProfile = useCallback(async () => {
        setIsSaving(true);
        setSaveError(null);

        try {
            const payload: UpdateProfileRequest = {
                department: form.department,
                phone: form.phone,
                country: form.country,
                timezone: form.timezone,
                office: form.office,
                bio: form.bio,
            };

            const updatedProfile = await profileService.updateProfile(payload);

            setForm((prev) => ({
                ...prev,
                department: updatedProfile.department ?? prev.department,
                phone: updatedProfile.phone ?? prev.phone,
                country: updatedProfile.country ?? prev.country,
                timezone: updatedProfile.timezone ?? prev.timezone,
                office: updatedProfile.office ?? prev.office,
                bio: updatedProfile.bio ?? prev.bio,
                updatedAt: updatedProfile.updatedAt ?? prev.updatedAt,
            }));

            // Update saved snapshot so dirty state resets
            setSavedSnapshot({
                department: updatedProfile.department ?? form.department,
                phone: updatedProfile.phone ?? form.phone,
                country: updatedProfile.country ?? form.country,
                timezone: updatedProfile.timezone ?? form.timezone,
                office: updatedProfile.office ?? form.office,
                bio: updatedProfile.bio ?? form.bio,
            });

            if (stagedAvatarFile) {
                await profileService.updateAvatar(stagedAvatarFile);
                setStagedAvatarFile(null);
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
        } catch (err) {
            console.error("Failed to save profile:", err);
            setSaveError(errorMessage(err, "Failed to save profile changes."));
        } finally {
            setIsSaving(false);
        }
    }, [form, stagedAvatarFile]);

    const lastUpdated = formatDate(form.updatedAt || form.createdAt);

    return {
        form,
        saved,
        isLoading,
        isSaving,
        fetchError,
        saveError,
        isDirty,
        avatarSrc,
        stagedAvatarFile,
        fileInputRef,
        lastUpdated,
        updateField,
        handleAvatarUpload,
        triggerFileInput,
        saveProfile,
        refetch: fetchProfile,
    };
}