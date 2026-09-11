import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, FlowState } from "@/types/storefront";
import type { MenuItem } from "@/types/menu";
import { storefrontService } from "../services/storefront.service";

export const useStorefront = () => {
    const [activeCategory, setActiveCategory] = useState("Burgers");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [flowState, setFlowState] = useState<FlowState>("feed");

    const { data: menuItems = [], isLoading } = useQuery({
        queryKey: ["storefrontMenu"],
        queryFn: storefrontService.getMenu,
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
        addToCart
    };
};
