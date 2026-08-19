import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types/auth";

export type AdministrationPageId = "users" | "administrators" | "roles";

export interface AdministrationPageConfig {
    id: AdministrationPageId;
    title: string;
    description: string;
    icon: LucideIcon;
    roles: Role[];
    route: string;
}

export interface AdministrationPageStatus {
    pageId: AdministrationPageId;
    isAvailable: boolean;
    estimatedRelease: string;
}
