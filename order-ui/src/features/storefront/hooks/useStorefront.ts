import { useState } from "react";
import type { CartItem, FlowState, MenuItem } from "@/types/storefront";

export const useStorefront = () => {
    const [activeCategory, setActiveCategory] = useState("Burgers");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [flowState, setFlowState] = useState<FlowState>("feed");

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