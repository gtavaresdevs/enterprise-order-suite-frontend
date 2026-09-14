import { useEffect, useState } from "react";
import type { ProfileResponse } from "@/types/profile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/profile/services/profile.service";
import { MOCK_PROFILE_SUMMARY } from "@/features/profile/constants/profile.constants";

// Lightweight profile summary for chrome like the account menu — fetches the
// real GET /me/profile once, and falls back to mock data if it fails so the
// header stays usable during a backend outage instead of crashing.
export function useProfileSummary() {
    const { user } = useAuth();

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [isMock, setIsMock] = useState(false);

    useEffect(() => {
        let cancelled = false;

        profileService
            .getProfile()
            .then((data) => {
                if (!cancelled) {
                    setProfile(data);
                    setIsMock(false);
                }
            })
            .catch((err) => {
                console.error("Failed to load profile for account menu, falling back to mock data:", err);
                if (!cancelled) {
                    setProfile(MOCK_PROFILE_SUMMARY);
                    setIsMock(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

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

    return { profile, isMock, displayName, email, role, initials };
}
