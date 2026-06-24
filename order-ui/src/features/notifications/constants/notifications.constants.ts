import {
  ShoppingCart,
  Truck,
  ClipboardList,
  Server,
  Zap,
  Activity,
  ShieldAlert,
  KeyRound,
  CreditCard,
} from "lucide-react";
import type { NotificationGroup } from "@/types/notifications";

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    category: "Logistics",
    accent: "text-blue-600 bg-blue-50 border-blue-100",
    items: [
      { id: "order-status",    icon: ShoppingCart, label: "Order Status Changes",       description: "Notify when an order transitions between Pending, Processing, or Completed states." },
      { id: "shipment-alerts", icon: Truck,        label: "Shipment & Tracking Alerts", description: "Real-time carrier updates, estimated delivery windows, and exception flags." },
      { id: "procurement",     icon: ClipboardList,label: "Procurement Notifications",  description: "Approved purchase orders, vendor confirmations, and inventory shortfall warnings." },
    ],
  },
  {
    category: "System",
    accent: "text-violet-600 bg-violet-50 border-violet-100",
    items: [
      { id: "maintenance",     icon: Server,    label: "Scheduled Maintenance Windows", description: "Advance notice of planned downtime, deployments, and infrastructure updates." },
      { id: "performance",     icon: Activity,  label: "Performance & Uptime Alerts",   description: "Threshold breaches, latency spikes, and availability degradation events." },
      { id: "api-status",      icon: Zap,       label: "API Status & Rate Limits",      description: "Webhook failures, quota warnings, and integration health summaries." },
    ],
  },
  {
    category: "Account",
    accent: "text-amber-600 bg-amber-50 border-amber-100",
    items: [
      { id: "login-alerts",    icon: ShieldAlert, label: "Login & Device Alerts",      description: "New sign-in locations, unrecognized devices, and suspicious access attempts." },
      { id: "password-change", icon: KeyRound,    label: "Password & Credential Changes", description: "Confirmation emails when account credentials or recovery options are updated." },
      { id: "billing",         icon: CreditCard,  label: "Billing & Invoice Events",   description: "Invoice generation, payment confirmations, and renewal reminders." },
    ],
  },
];