export type OrderChannel = "Online" | "Dine-in" | "Phone";
export type Fulfillment = "Pickup" | "Delivery";
export type OrderStatus = "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "PayLater";
export type PaymentMethod = "PIX" | "Card" | "Cash";
export type CardType = "Credit" | "Debit";

export interface Modifier {
  label: string;
  price: number;
}

export interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers?: Modifier[];
}

export interface Order {
  id: string;
  channel: OrderChannel;
  fulfillment?: Fulfillment;
  table?: string;
  customerName: string;
  customerPhone: string;
  items: OrderLine[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  cardType?: CardType;
  changeFor?: number;
  createdAt: string;
  total: number;
}