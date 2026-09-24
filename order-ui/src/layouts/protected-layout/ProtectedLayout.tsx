import { useEffect, useReducer, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { refreshSession } from "@/api/client";
import { isTokenExpired } from "@/features/auth/utils/auth.utils";
import { ServiceUnavailable } from "@/components/errors/ServiceUnavailable";

// Invisible route guard: no token → /login; expired token → refresh before rendering
// anything, so an expired session never reaches the shell. useLocation re-renders this on
// every navigation, so the expiry check runs per route change.
export function ProtectedLayout() {
    const location = useLocation();
    const [outage, setOutage] = useState(false);
    const [, rerender] = useReducer((n: number) => n + 1, 0);

    const token = localStorage.getItem("accessToken");
    const expired = !!token && isTokenExpired(token);

    useEffect(() => {
        if (!expired) return;
        let cancelled = false;
        // A 4xx from refresh ends the session and redirects on its own; anything else is an outage.
        refreshSession()
            .then(() => !cancelled && rerender())
            .catch(() => !cancelled && setOutage(true));
        return () => {
            cancelled = true;
        };
    }, [expired, location.pathname]);

    if (!token) return <Navigate to="/login" replace />;
    if (outage) return <ServiceUnavailable onRetry={() => window.location.reload()} />;
    if (expired) return null;
    return <Outlet />;
}
