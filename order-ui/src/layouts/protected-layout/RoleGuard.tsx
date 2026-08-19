import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "@/types/auth";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface RoleGuardProps {
    allowedRoles: Role[];
    redirectTo?: string;
    children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, redirectTo = "/home", children }: RoleGuardProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const hasPermission = allowedRoles.some((role) => user.roles.includes(role));

    if (!hasPermission) {
        return <Navigate to={redirectTo} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
