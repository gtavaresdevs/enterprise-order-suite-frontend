import { useState, useEffect } from "react";
import type { User } from "@/types/auth";
import { extractUserFromStorage } from "../utils/auth.utils";

export function useAuth() {
    const [user, setUser] = useState<User | null>(() => extractUserFromStorage());
    const isLoading = false;

    // Initial user comes from the lazy useState initializer; only cross-tab changes need syncing.
    useEffect(() => {
        const handleStorageChange = () => {
            setUser(extractUserFromStorage());
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return { user, isLoading };
}

