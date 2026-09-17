import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem, FlowState, PlaceOrderInput } from "@/types/storefront";
import type { MenuItem } from "@/types/menu";
import type { Order, OrderLine } from "@/types/orders";
import { storefrontService } from "../services/storefront.service";
import { ordersService } from "@/features/orders/services/orders.service";
import { PICKUP_ETA_MINUTES } from "../constants/storefront.constants";

export const useStorefront = () => {
    const [activeCategory, setActiveCategory] = useState("Burgers");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [flowState, setFlowState] = useState<FlowState>("feed");
    const queryClient = useQueryClient();

    const { data: menuItems = [], isLoading } = useQuery({
        queryKey: ["menuItems"],
        queryFn: storefrontService.getMenu,
        select: (items) => items.filter((item) => item.available),
    });

    const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((x) => x.menuId === item.menuId);
            if (existing) {
                return prev.map((x) =>
                    x.menuId === item.menuId ? { ...x, quantity: x.quantity + item.quantity } : x
                );
            }
            return [...prev, item];
        });
    };

    const createOrderMutation = useMutation({
        mutationFn: (input: Omit<Order, "id">) => ordersService.createOrder(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });

    const placeOrder = (input: PlaceOrderInput) => {
        const etaMinutes = input.fulfillment === "Delivery" ? (input.deliveryZone?.etaMinutes ?? PICKUP_ETA_MINUTES) : PICKUP_ETA_MINUTES;
        const deliveryFee = input.fulfillment === "Delivery" ? (input.deliveryZone?.feeAmount ?? 0) : 0;
        const items: OrderLine[] = cart.map((c) => ({
            menuItemId: c.menuId,
            name: c.name,
            quantity: c.quantity,
            unitPrice: c.price,
            modifiers: [],
        }));
        createOrderMutation.mutate({
            channel: "Online",
            fulfillment: input.fulfillment,
            deliveryZone: input.deliveryZone?.neighborhood,
            etaMinutes,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            items,
            status: "New",
            paymentStatus: "Paid",
            paymentMethod: input.paymentMethod,
            cardType: input.cardType,
            changeFor: input.changeFor,
            createdAt: new Date().toISOString().slice(0, 10),
            total: cartTotal + deliveryFee,
        });
    };

    return {
        menuItems,
        isLoading,
        activeCategory,
        setActiveCategory,
        selectedItem,
        setSelectedItem,
        cart,
        setCart,
        cartTotal,
        cartCount,
        flowState,
        setFlowState,
        addToCart,
        placeOrder,
        placedOrder: createOrderMutation.data ?? null,
        isPlacingOrder: createOrderMutation.isPending,
    };
};
