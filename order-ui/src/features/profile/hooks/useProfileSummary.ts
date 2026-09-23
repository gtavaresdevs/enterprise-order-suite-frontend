import { useQuery } from "@tanstack/react-query";
import type { ProfileResponse } from "@/types/profile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/profile/services/profile.service";
import { MOCK_PROFILE_SUMMARY } from "@/features/profile/constants/profile.constants";

// Lightweight profile summary for chrome (account menu, sidebar, home greeting).
// Backed by one shared query so every consumer reads the same cached GET /me/profile
// instead of each firing its own request. Falls back to mock data if it fails so the
// header stays usable during a backend outage instead of crashing.
export function useProfileSummary() {
    const { user } = useAuth();

    const { data, isPending } = useQuery({
        queryKey: ["profile", "summary"],
        staleTime: 5 * 60_000,
        queryFn: async (): Promise<{ profile: ProfileResponse; isMock: boolean }> => {
            try {
                return { profile: await profileService.getProfile(), isMock: false };
            } catch (err) {
                console.error("Failed to load profile for account menu, falling back to mock data:", err);
                return { profile: MOCK_PROFILE_SUMMARY, isMock: true };
            }
        },
    });

    const profile = data?.profile ?? null;
    const isMock = data?.isMock ?? false;

    const source = profile ?? user;
    const fullName = `${source?.firstName || ""} ${source?.lastName || ""}`.trim();

    // While the request is in flight, fall back to the locally decoded JWT so
    // the menu doesn't flash an empty "Account" state before it resolves.
    const displayName = profile
        ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.email
        : user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
          : "Account";

    const email = profile?.email || user?.email || "";
    const role = profile?.role || user?.roles?.[0] || "USER";
    const initials = profile
        ? ((profile.firstName?.[0] || "") + (profile.lastName?.[0] || "")).toUpperCase() || "U"
        : user
          ? ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "U"
          : "U";

    return { profile, isMock, isPending, fullName, displayName, email, role, initials };
}
