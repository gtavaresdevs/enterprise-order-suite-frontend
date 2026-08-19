import { useState, useCallback } from "react";
import { profileService } from "@/features/profile/services/profile.service";

interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const INITIAL_STATE: ChangePasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

export function useChangePassword() {
    const [form, setForm] = useState<ChangePasswordForm>(INITIAL_STATE);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateField = useCallback(<K extends keyof ChangePasswordForm>(
        field: K,
        value: ChangePasswordForm[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError(null);
    }, []);

    const passwordsMatch = form.newPassword === form.confirmPassword;
    const isValid =
        form.currentPassword.length > 0 &&
        form.newPassword.length >= 8 &&
        passwordsMatch;

    const submit = useCallback(async () => {
        if (!isValid) {
            if (!passwordsMatch) setError("Passwords do not match.");
            return;
        }

        setIsSaving(true);
        try {
            // Wire through the service layer (change B) with typed payload (change E)
            await profileService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            setSaved(true);
            setForm(INITIAL_STATE);
            setTimeout(() => setSaved(false), 2200);
        } finally {
            setIsSaving(false);
        }
    }, [isValid, passwordsMatch, form.currentPassword, form.newPassword]);

    return {
        form,
        isSaving,
        saved,
        error,
        isValid,
        updateField,
        submit,
    };
}
