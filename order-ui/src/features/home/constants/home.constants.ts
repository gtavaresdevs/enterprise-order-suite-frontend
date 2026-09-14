import { ShoppingCart, ChefHat, UtensilsCrossed, Link2 } from "lucide-react";
import type { ActionCard } from "@/types/home";

export const ACTION_CARDS: ActionCard[] = [
  {
    icon: ShoppingCart,
    label: "New Order",
    description: "Enter a phone or dine-in order on a customer's behalf.",
    to: "/orders",
    accent: "hover:border-slate-300",
    iconBg: "bg-slate-950 text-slate-50",
  },
  {
    icon: ChefHat,
    label: "Open Kitchen Display",
    description: "View and advance the live kitchen order queue.",
    to: "/kds",
    accent: "hover:border-amber-200",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    icon: UtensilsCrossed,
    label: "View Menu",
    description: "Manage items, prices, availability, and stock.",
    to: "/menu",
    accent: "hover:border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Link2,
    label: "Copy Ordering Link",
    description: "Share the public storefront link via WhatsApp or Instagram.",
    copyValue: "/storefront",
    accent: "hover:border-blue-200",
    iconBg: "bg-blue-50 text-blue-600",
  },
];
