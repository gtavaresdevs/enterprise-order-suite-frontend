import { useQuery } from '@tanstack/react-query';
import type { Order } from '@/types/orders';
import { ordersService } from '@/features/orders/services/orders.service';
import { KDS_POLLING_INTERVAL } from '../constants/kds.constants';

const KDS_STATUSES: Order["status"][] = ["New", "Preparing", "Ready"];

export const useKdsOrders = () => {
    return useQuery({
        queryKey: ['orders'],
        queryFn: ordersService.getOrders,
        select: (orders) => orders.filter((order) => KDS_STATUSES.includes(order.status)),
        refetchInterval: KDS_POLLING_INTERVAL,
    });
};
