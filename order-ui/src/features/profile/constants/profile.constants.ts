import { Clock, Star, Shield, Hash } from "lucide-react";
import type { ProfileResponse, UserStat } from "@/types/profile";


export const USER_STATS: UserStat[] = [
    { icon: Clock, label: "Member Since", value: "Mar 2022", mono: false },
    { icon: Star, label: "Account Tier", value: "Enterprise", mono: false },
    { icon: Shield, label: "Security", value: "2FA Enabled", mono: false },
    { icon: Hash, label: "User ID", value: "USR-00412", mono: true },
];

// Fallback shown in the account menu when GET /me/profile is unreachable, so a
// backend outage doesn't blank out or crash the header.
export const MOCK_PROFILE_SUMMARY: ProfileResponse = {
    id: 0,
    email: "jane.doe@example.com",
    firstName: "Jane",
    lastName: "Doe",
    role: "USER",
    phone: null,
    country: null,
    timezone: null,
    department: null,
    office: null,
    bio: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};