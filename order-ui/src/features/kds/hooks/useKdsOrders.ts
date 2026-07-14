import { useQuery } from '@tanstack/react-query';
import { getKdsTickets } from '../services/kds.service';
import { KDS_POLLING_INTERVAL } from '../constants/kds.constants';

export const useKdsOrders = () => {
    return useQuery({
        queryKey: ['kds-tickets'],
        queryFn: getKdsTickets,
        refetchInterval: KDS_POLLING_INTERVAL,
    });
};