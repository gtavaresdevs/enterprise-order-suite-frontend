import api from '@/api/client';
import type { AnalyticsKPI, RevenueData, ChannelData, TopItem, HeatmapData } from '@/types/analytics';

export const analyticsService = {
    getKPIs: async (): Promise<AnalyticsKPI[]> => {
        const { data } = await api.get('/api/v1/analytics/kpis');
        return data;
    },
    getRevenue: async (): Promise<RevenueData[]> => {
        const { data } = await api.get('/api/v1/analytics/revenue');
        return data;
    },
    getChannels: async (): Promise<ChannelData[]> => {
        const { data } = await api.get('/api/v1/analytics/channels');
        return data;
    },
    getTopItems: async (): Promise<TopItem[]> => {
        const { data } = await api.get('/api/v1/analytics/top-items');
        return data;
    },
    getHeatmap: async (): Promise<HeatmapData[]> => {
        const { data } = await api.get('/api/v1/analytics/heatmap');
        return data;
    }
};