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
  icon: LucideIcon;
  end?: boolean;
  roles?: Role[];
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { to: "/home", label: "Dashboard", icon: Home, end: true },
  { to: "/orders", label: "Orders", icon: ShoppingCart, end: false },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed, end: false },
  { to: "/tables", label: "Tables", icon: QrCode, end: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, end: false },
];

export const ADMINISTRATION_ITEMS: NavItem[] = [
  {
    label: "Administration",
    icon: Shield,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      { to: "/administration/team", label: "Team", icon: Users, roles: ["ADMIN", "SUPER_ADMIN"] },
      { to: "/administration/roles", label: "Roles", icon: KeySquare, roles: ["SUPER_ADMIN"] },
      { to: "/administration/audit-log", label: "Audit Log", icon: ScrollText, roles: ["SUPER_ADMIN"] },
    ],
  },
];