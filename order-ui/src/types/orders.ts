export type OrderStatus = "New" | "Preparing" | "In Route" | "Delivered";

export interface Modifier {
  label: string;
  price: number;
  type: "remove" | "addon";
}

export interface ProductLine {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers?: Modifier[];
}

export interface Order {
  id: string;
  customer: string;
  company: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  products: ProductLine[];
  dateCreated: string;
  estimatedDelivery: string;
  total: number;
  status: OrderStatus;
}

export interface DraftProduct {
  _key: string;
  name: string;
  quantity: string;
  unitPrice: string;
}