export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

export interface ProductLine {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  inStock: boolean;
  stockQty: number;
}

export interface Order {
  id: string;
  customer: string;
  company: string;
  email: string;
  region: string;
  products: ProductLine[];
  dateCreated: string;
  total: number;
  status: OrderStatus;
}

export type OrderFilter = OrderStatus | "All";