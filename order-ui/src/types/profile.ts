import type React from "react";

export interface UserStat {
    icon: React.ElementType;
    label: string;
    value: string;
    mono: boolean;
}

export interface UserProfileForm {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    phone: string;
    country: string;
    timezone: string;
    office: string;
    bio: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}