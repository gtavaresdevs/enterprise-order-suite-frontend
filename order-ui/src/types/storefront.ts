import type { DeliveryZone, Fulfillment, PaymentMethod, CardType } from "@/types/orders";

export interface CartItem {
    menuId: string;
    name: string;
    price: number;
    quantity: number;
}

export type FlowState = "feed" | "cart" | "checkout" | "pixWaiting" | "success";

export interface PlaceOrderInput {
    customerName: string;
    customerPhone: string;
    fulfillment: Fulfillment;
    deliveryZone?: DeliveryZone;
    paymentMethod: PaymentMethod;
    cardType?: CardType;
    changeFor?: number;
}