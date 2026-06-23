import {
  Home,
  ShoppingCart,
  Package,
  BarChart3,
  Shield,
  type LucideIcon
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { to: "/home", label: "Dashboard", icon: Home, end: true },
  { to: "/orders", label: "Orders", icon: ShoppingCart, end: false },
  { to: "/inventory", label: "Inventory", icon: Package, end: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, end: false },
  { to: "/security", label: "Security", icon: Shield, end: false },
];