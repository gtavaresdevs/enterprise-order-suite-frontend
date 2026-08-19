import { Users, UserCog, KeySquare } from "lucide-react";
import type { AdministrationPageConfig } from "@/features/administration/types/administration.types";

export const ADMINISTRATION_PAGES: Record<
    AdministrationPageConfig["id"],
    AdministrationPageConfig
> = {
    users: {
        id: "users",
        title: "Users",
        description: "Manage user accounts, invitations, and access across your organization.",
        icon: Users,
        roles: ["ADMIN", "SUPER_ADMIN"],
        route: "/administration/users",
    },
    administrators: {
        id: "administrators",
        title: "Administrators",
        description: "Configure administrator accounts and elevated platform permissions.",
        icon: UserCog,
        roles: ["SUPER_ADMIN"],
        route: "/administration/administrators",
    },
    roles: {
        id: "roles",
        title: "Roles & Permissions",
        description: "Define roles, permission sets, and access policies for the platform.",
        icon: KeySquare,
        roles: ["SUPER_ADMIN"],
        route: "/administration/roles",
    },
};

export const COMING_SOON_MESSAGE =
    "This module is under active development and will be available in a future release.";

export const ESTIMATED_RELEASE = "Q2 2026";
