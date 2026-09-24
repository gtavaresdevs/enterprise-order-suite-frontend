import { useQuery } from "@tanstack/react-query";
import type { ProfileResponse } from "@/types/profile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/profile/services/profile.service";

// Lightweight profile summary for chrome (account menu, sidebar, home greeting).
// Backed by one shared query so every consumer reads the same cached GET /me/profile
// instead of each firing its own request. Errors are surfaced, never papered over with
// placeholder data: 401s are handled by the api client (refresh or /login), and anything
// else is shown by AppLayout as a "service unavailable" screen.
export function useProfileSummary() {
    const { user } = useAuth();

    const { data, isPending, isError, refetch } = useQuery<ProfileResponse>({
        queryKey: ["profile", "summary"],
        staleTime: 5 * 60_000,
        queryFn: () => profileService.getProfile(),
    });

    const profile = data ?? null;

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

    return { profile, isPending, isError, refetch, fullName, displayName, email, role, initials };
}
