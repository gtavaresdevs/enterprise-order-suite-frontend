import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrderStatus } from '@/types/orders';
import { ordersService } from '@/features/orders/services/orders.service';

export const useUpdateKdsStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
            ordersService.updateOrderStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};
