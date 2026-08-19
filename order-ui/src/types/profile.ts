// Re-export from feature-scoped types for backwards compatibility.
// New consumers within the profile feature should import from
// @/features/profile/types/profile.types directly.
export type { UserStat, UserProfileForm } from "@/features/profile/types/profile.types";