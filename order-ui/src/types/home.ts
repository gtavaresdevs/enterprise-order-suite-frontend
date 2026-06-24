import type { ElementType } from "react";

// ── Navigation & Action Contracts ───────────────────────────────────────────

export interface NavItem {
  icon: ElementType;
  label: string;
  to: string;
}

export interface ActionCard {
  icon: ElementType;
  label: string;
  description: string;
  to?: string;
  badge?: string;
  accent: string;
  iconBg: string;
}

// ── Dashboard/Portal Data Contracts ────────────────────────────────────────

export interface Stat {
  label: string;
  value: string;
  sub: string;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
  trend?: "up" | "down";
  mono?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  time: string;
}

export interface HomeData {
  actions: ActionCard[];
  stats: Stat[];
  chatMessages: ChatMessage[];
}