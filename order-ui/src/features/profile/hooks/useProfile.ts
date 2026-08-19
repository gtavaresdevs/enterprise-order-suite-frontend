import { useState, useCallback, useRef, useEffect } from "react";
import type { UserProfileForm } from "@/features/profile/types/profile.types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/profile/services/profile.service";

export function useProfile() {
    const { user } = useAuth();

    const initialForm: UserProfileForm = {
        firstName: user?.firstName || "Alex",
        lastName: user?.lastName || "Watson",
        email: user?.email || "a.watson@enterprise.io",
        role: "Operations Director",
        department: "Supply Chain & Logistics",
        phone: "+1 (415) 882-0044",
        country: "United States",
        timezone: "America/Los_Angeles (PST)",
        office: "San Francisco HQ",
        bio: "Senior operations lead overseeing enterprise procurement workflows and cross-regional fulfillment logistics for 12+ years.",
    };

    const [form, setForm] = useState<UserProfileForm>(initialForm);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
    const [stagedAvatarFile, setStagedAvatarFile] = useState<File | null>(null);
    const [lastUpdated] = useState<string>("Jul 22, 2026");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Snapshot of the last-saved editable values for dirty comparison (change D)
    const savedSnapshot = useRef({
        phone: initialForm.phone,
        country: initialForm.country,
        timezone: initialForm.timezone,
        office: initialForm.office,
        bio: initialForm.bio,
    });

    // Keep snapshot in sync when user data loads asynchronously
    useEffect(() => {
        savedSnapshot.current = {
            phone: initialForm.phone,
            country: initialForm.country,
            timezone: initialForm.timezone,
            office: initialForm.office,
            bio: initialForm.bio,
        };
    }, [user]);

    // Track dirty state by comparing editable fields to the saved snapshot
    const isDirty =
        form.phone !== savedSnapshot.current.phone ||
        form.country !== savedSnapshot.current.country ||
        form.timezone !== savedSnapshot.current.timezone ||
        form.office !== savedSnapshot.current.office ||
        form.bio !== savedSnapshot.current.bio ||
        stagedAvatarFile !== null;

    const updateField = useCallback(<K extends keyof UserProfileForm>(
        field: K,
        value: UserProfileForm[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
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

        try {
            // Wire through the service layer (change B)
            const { phone, country, timezone, office, bio } = form;
            await profileService.saveProfile({ phone, country, timezone, office, bio });

            if (stagedAvatarFile) {
                await profileService.updateAvatar(stagedAvatarFile);
            }

            // Update saved snapshot so dirty resets correctly (change D)
            savedSnapshot.current = { phone, country, timezone, office, bio };
            setStagedAvatarFile(null);
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
        } finally {
            setIsSaving(false);
        }
    }, [form, stagedAvatarFile]);

    return {
        form,
        saved,
        isSaving,
        isDirty,
        avatarSrc,
        stagedAvatarFile,
        fileInputRef,
        lastUpdated,
        updateField,
        handleAvatarUpload,
        triggerFileInput,
        saveProfile,
    };
}