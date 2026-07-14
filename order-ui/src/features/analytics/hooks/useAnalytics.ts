import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export const useAnalytics = () => {
    const kpis = useQuery({
        queryKey: ['analytics', 'kpis'],
        queryFn: analyticsService.getKPIs,
    });

    const revenue = useQuery({
        queryKey: ['analytics', 'revenue'],
        queryFn: analyticsService.getRevenue,
    });

    const channels = useQuery({
        queryKey: ['analytics', 'channels'],
        queryFn: analyticsService.getChannels,
    });

    const topItems = useQuery({
        queryKey: ['analytics', 'topItems'],
        queryFn: analyticsService.getTopItems,
    });

    const heatmap = useQuery({
        queryKey: ['analytics', 'heatmap'],
        queryFn: analyticsService.getHeatmap,
    });

    return {
        kpis,
        revenue,
        channels,
        topItems,
        heatmap,
        isLoading: kpis.isLoading || revenue.isLoading || channels.isLoading || topItems.isLoading || heatmap.isLoading
    };
};