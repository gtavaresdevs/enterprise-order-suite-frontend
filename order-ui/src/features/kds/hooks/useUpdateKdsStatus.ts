import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTicketStatus } from '../services/kds.service';

export const useUpdateKdsStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            ticketId,
            itemId,
            completed,
        }: {
            ticketId: string;
            itemId: string;
            completed: boolean;
        }) => updateTicketStatus(ticketId, itemId, completed),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kds-tickets'] });
        },
    });
};