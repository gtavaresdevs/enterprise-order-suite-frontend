import type React from "react";

export interface UserStat {
    icon: React.ElementType;
    label: string;
    value: string;
    mono: boolean;
}

export interface ProfileResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string | null;
    country: string | null;
    timezone: string | null;
    department: string | null;
    office: string | null;
    bio: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    phone?: string;
    country?: string;
    timezone?: string;
    department?: string;
    office?: string;
    bio?: string;
}

export interface UserProfileForm {
    id?: number;
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
    createdAt?: string;
    updatedAt?: string;
}