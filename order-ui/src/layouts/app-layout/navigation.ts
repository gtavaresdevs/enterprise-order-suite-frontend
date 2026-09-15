import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Shield,
  Users,
  KeySquare,
  ScrollText,
  type LucideIcon
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  to?: string;
  label: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
  roles?: Role[];
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { to: "/home", label: "Dashboard", labelKey: "nav.dashboard", icon: Home, end: true },
  { to: "/orders", label: "Orders", labelKey: "nav.orders", icon: ShoppingCart, end: false },
  { to: "/menu", label: "Menu", labelKey: "nav.menu", icon: UtensilsCrossed, end: false },
  { to: "/tables", label: "Tables", labelKey: "nav.tables", icon: QrCode, end: false },
  { to: "/analytics", label: "Analytics", labelKey: "nav.analytics", icon: BarChart3, end: false },
];

export const ADMINISTRATION_ITEMS: NavItem[] = [
  {
    label: "Administration",
    labelKey: "nav.administration",
    icon: Shield,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      { to: "/administration/team", label: "Team", labelKey: "nav.team", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
      { to: "/administration/roles", label: "Roles", labelKey: "nav.roles", icon: KeySquare, roles: ["SUPER_ADMIN"] },
      { to: "/administration/audit-log", label: "Audit Log", labelKey: "nav.auditLog", icon: ScrollText, roles: ["SUPER_ADMIN"] },
    ],
  },
];