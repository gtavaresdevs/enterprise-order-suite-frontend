import {
  ShoppingCart,
  Shield,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { ActionCard, ChatMessage, Stat } from "@/types/home";

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    role: "user",
    text: "Let's enable pages for my project. Create a new Landing Home Page at /home and move the existing Order Management to /orders.",
    time: "14:02",
  },
  {
    role: "assistant",
    text: "Got it. I'll set up React Router, scaffold a post-login home portal at /home, and relocate the full order management screen to /orders with a persistent sidebar layout.",
    time: "14:02",
  },
  {
    role: "user",
    text: "Include a personalized header, quick action cards, stat snapshots, and this embedded chat block.",
    time: "14:03",
  },
  {
    role: "assistant",
    text: "Building now — all four sections with live timestamp, avatar dropdown, routed action cards, metric tiles derived from order data, and a self-referential assistant dialogue embedded in the layout.",
    time: "14:03",
  },
];

export const ACTION_CARDS: ActionCard[] = [
  {
    icon: ShoppingCart,
    label: "Order Management Hub",
    description: "View historical purchases, modify statuses, and track active logistical fulfillment pipelines.",
    to: "/orders",
    badge: "8 active",
    accent: "hover:border-slate-300",
    iconBg: "bg-slate-950 text-slate-50",
  },
  {
    icon: Shield,
    label: "Account & Security Profile",
    description: "Update corporate billing variables, configure access credentials, and adjust notification preferences.",
    accent: "hover:border-blue-200",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    icon: Package,
    label: "Product Procurement Inventory",
    description: "Discover company catalogs and examine current line item quantities across all fulfillment centers.",
    accent: "hover:border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
];

export const STATS: Stat[] = [
  {
    label: "Active Procurement Count",
    value: "23",
    sub: "↑ 4 since last week",
    icon: TrendingUp,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    trend: "up",
  },
  {
    label: "Last Transaction ID",
    value: "ORD-2024-9048",
    sub: "Nov 20, 2024 · Kyoto Data Systems",
    icon: Clock,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    mono: true,
  },
  {
    label: "Account Tier Status",
    value: "Enterprise",
    sub: "All features unlocked · SLA active",
    icon: CheckCircle2,
    iconColor: "text-slate-600",
    iconBg: "bg-slate-100",
  },
];