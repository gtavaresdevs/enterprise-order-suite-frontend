import React from "react";

export interface UserStat {
    icon: React.ElementType;
    label: string;
    value: string;
    mono: boolean;
}

export interface UserProfileForm {
    name: string;
    email: string;
    role: string;
    department: string;
    phone: string;
    location: string;
    bio: string;
}