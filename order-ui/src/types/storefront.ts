export interface SizeOption {
    id: string;
    label: string;
    price: number;
}

export interface AddonOption {
    id: string;
    label: string;
    price: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    sizes?: SizeOption[];
    addons?: AddonOption[];
}

export interface CartItem {
    menuId: string;
    name: string;
    price: number;
    quantity: number;
}

export type FlowState = "feed" | "cart" | "checkout" | "success";