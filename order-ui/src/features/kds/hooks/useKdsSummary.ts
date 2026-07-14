import { useQuery } from '@tanstack/react-query';
import { getKdsSummary } from '../services/kds.service';
import { KDS_POLLING_INTERVAL } from '../constants/kds.constants';

export const useKdsSummary = () => {
    return useQuery({
        queryKey: ['kds-summary'],
        queryFn: getKdsSummary,
        refetchInterval: KDS_POLLING_INTERVAL,
    });
};
