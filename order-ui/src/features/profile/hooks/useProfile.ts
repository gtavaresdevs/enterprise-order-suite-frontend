import { useState, useCallback, useRef } from "react";
import type { UserProfileForm } from "@/types/profile";

const DEFAULT_PROFILE: UserProfileForm = {
    name: "Alex Watson",
    email: "a.watson@enterprise.io",
    role: "Operations Director",
    department: "Supply Chain & Logistics",
    phone: "+1 (415) 882-0044",
    location: "San Francisco, CA",
    bio: "Senior operations lead overseeing enterprise procurement workflows and cross-regional fulfillment logistics for 12+ years.",
};

export function useProfile() {
    const [form, setForm] = useState<UserProfileForm>(DEFAULT_PROFILE);
    const [saved, setSaved] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
    }, []);

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const saveProfile = useCallback(() => {
        // TanStack Query mutation simulation
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    }, [form]);

    return {
        form,
        saved,
        avatarSrc,
        fileInputRef,
        updateField,
        handleAvatarUpload,
        triggerFileInput,
        saveProfile,
    };
}