import type { ElementType } from "react";
import type { OrderChannel } from "@/types/orders";

export type AnalyticsKPI = {
  label: string;
  value: string | number;
  isCurrency?: boolean;
  icon: ElementType;
};

export type RevenueData = {
  day: string;
  revenue: number;
};

export type ChannelData = {
  name: OrderChannel;
  value: number;
  color: string;
};

export type TopItem = {
  id: string;
  name: string;
  units: number;
  image: string;
};

export type HeatmapData = {
  label: string;
  intensity: number;
};