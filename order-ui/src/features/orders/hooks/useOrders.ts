import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus } from "@/types/orders";
import { ordersService } from "@/features/orders/services/orders.service";

export function useOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersService.getOrders,
  });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Order, "id">) => ordersService.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    orders,
    isLoading,
    createOrder: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateOrderStatus: (id: string, status: OrderStatus) => updateStatusMutation.mutate({ id, status }),
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}