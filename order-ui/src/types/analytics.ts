export type AnalyticsKPI = {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: React.ElementType;
};

export type RevenueData = {
  day: string;
  revenue: number;
};

export type ChannelData = {
  name: string;
  value: number;
  color: string;
};

export type TopItem = {
  id: number;
  name: string;
  units: number;
  trend: string;
  image: string;
};

export type HeatmapData = {
  time: string;
  intensity: number;
};