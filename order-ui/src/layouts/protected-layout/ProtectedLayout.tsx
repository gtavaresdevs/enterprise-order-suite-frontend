import { Navigate, Outlet } from "react-router-dom";

export function ProtectedLayout() {
    // Validate authentication directly via local storage logic
    const isAuthenticated = !!localStorage.getItem("accessToken");

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ⚠️ ARCHITECTURAL FIX: 
    // We removed the conflicting 'min-h-screen bg-slate-50' shell from the legacy version.
    // The ProtectedLayout now acts purely as an invisible route guard. 
    // It offloads UI rendering completely to the <AppLayout /> downstream.
    return <Outlet />;
}