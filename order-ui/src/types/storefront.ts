export interface CartItem {
    menuId: string;
    name: string;
    price: number;
    quantity: number;
}

export type FlowState = "feed" | "cart" | "checkout" | "pixWaiting" | "success";