import { Clock, Star, Shield, Hash } from "lucide-react";
import type { UserStat } from "@/types/profile";

export const USER_STATS: UserStat[] = [
    { icon: Clock, label: "Member Since", value: "Mar 2022", mono: false },
    { icon: Star, label: "Account Tier", value: "Enterprise", mono: false },
    { icon: Shield, label: "Security", value: "2FA Enabled", mono: false },
    { icon: Hash, label: "User ID", value: "USR-00412", mono: true },
];