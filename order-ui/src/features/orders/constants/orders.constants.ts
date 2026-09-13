import { Clock, Loader2, PackageCheck, CheckCircle2, XCircle } from "lucide-react";
import type { Order, OrderStatus } from "@/types/orders";

export const ORDERS: Order[] = [
  {
    id: "DEL-2024-8801",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Marcus Chen",
    customerPhone: "+1 (415) 555-0182",
    items: [
      {
        menuItemId: "m1", name: "Double Smash Burger", quantity: 2, unitPrice: 14.99,
        modifiers: [
          { label: "No Onion", price: 0 },
          { label: "Extra Bacon", price: 2.00 },
          { label: "Extra Cheese", price: 1.50 },
        ],
      },
      { menuItemId: "m5", name: "Truffle Loaded Fries", quantity: 1, unitPrice: 8.99, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 42.47,
    status: "Preparing",
    paymentStatus: "Paid",
  },
  {
    id: "DEL-2024-8802",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Alicia Torres",
    customerPhone: "+1 (628) 555-0294",
    items: [
      {
        menuItemId: "m3", name: "Margherita Pizza 12\"", quantity: 1, unitPrice: 18.99,
        modifiers: [
          { label: "Extra Crispy Crust", price: 0 },
          { label: "No Basil", price: 0 },
        ],
      },
      {
        menuItemId: "m7", name: "Caramel Latte", quantity: 2, unitPrice: 5.99,
        modifiers: [
          { label: "Oat Milk", price: 0.80 },
          { label: "No Sugar", price: 0 },
        ],
      },
    ],
    createdAt: "2024-11-20",
    total: 43.56,
    status: "New",
    paymentStatus: "Paid",
  },
  {
    id: "DEL-2024-8803",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Jordan Webb",
    customerPhone: "+1 (510) 555-0371",
    items: [
      {
        menuItemId: "m2", name: "Crispy Chicken Sandwich", quantity: 1, unitPrice: 13.49,
        modifiers: [
          { label: "Spicy Level 2", price: 0 },
          { label: "Add Avocado", price: 1.50 },
        ],
      },
      { menuItemId: "m6", name: "Strawberry Milkshake", quantity: 1, unitPrice: 7.49, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 23.48,
    status: "Ready",
    paymentStatus: "Paid",
  },
  {
    id: "PHN-2024-8804",
    channel: "Phone",
    fulfillment: "Pickup",
    customerName: "Priya Nair",
    customerPhone: "+1 (415) 555-0449",
    items: [
      { menuItemId: "m4", name: "Caesar Salad", quantity: 2, unitPrice: 11.99, modifiers: [{ label: "No Croutons", price: 0 }] },
      { menuItemId: "NM-SPARKLING-WATER", name: "Sparkling Water", quantity: 2, unitPrice: 2.49, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 29.94,
    status: "Completed",
    paymentStatus: "PayLater",
  },
  {
    id: "DEL-2024-8805",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Lena Fischer",
    customerPhone: "+1 (408) 555-0512",
    items: [
      {
        menuItemId: "m5", name: "Truffle Loaded Fries", quantity: 1, unitPrice: 10.99,
        modifiers: [{ label: "Extra Truffle Oil", price: 1.50 }],
      },
      { menuItemId: "m8", name: "Chocolate Brownie", quantity: 2, unitPrice: 6.49, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 25.47,
    status: "New",
    paymentStatus: "Paid",
  },
  {
    id: "DEL-2024-8806",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Mateo Rivera",
    customerPhone: "+1 (650) 555-0673",
    items: [
      {
        menuItemId: "m1", name: "Double Smash Burger", quantity: 3, unitPrice: 14.99,
        modifiers: [{ label: "No Pickles", price: 0 }, { label: "Truffle Mayo", price: 1.00 }],
      },
    ],
    createdAt: "2024-11-20",
    total: 50.97,
    status: "Ready",
    paymentStatus: "Paid",
  },
  {
    id: "DIN-2024-8807",
    channel: "Dine-in",
    table: "Table 4",
    customerName: "Sophie Laurent",
    customerPhone: "+1 (415) 555-0821",
    items: [
      { menuItemId: "m3", name: "Margherita Pizza 12\"", quantity: 1, unitPrice: 18.99, modifiers: [] },
      { menuItemId: "m7", name: "Caramel Latte", quantity: 1, unitPrice: 5.99, modifiers: [{ label: "Almond Milk", price: 0.80 }] },
    ],
    createdAt: "2024-11-19",
    total: 25.78,
    status: "Completed",
    paymentStatus: "PayLater",
  },
  {
    id: "DEL-2024-8808",
    channel: "Online",
    fulfillment: "Delivery",
    customerName: "Kwame Asante",
    customerPhone: "+1 (415) 555-0934",
    items: [
      { menuItemId: "m2", name: "Crispy Chicken Sandwich", quantity: 2, unitPrice: 13.49, modifiers: [{ label: "BBQ Sauce", price: 0 }] },
      { menuItemId: "m5", name: "Truffle Loaded Fries", quantity: 2, unitPrice: 8.99, modifiers: [] },
    ],
    createdAt: "2024-11-20",
    total: 47.96,
    status: "Preparing",
    paymentStatus: "Paid",
  },
];

export const STATUS_CONFIG: Record<OrderStatus, { pill: string; dot: string; Icon: React.ElementType }> = {
  New: { pill: "text-blue-700 bg-blue-50 border border-blue-200", dot: "bg-blue-500", Icon: Clock },
  Preparing: { pill: "text-amber-700 bg-amber-50 border border-amber-200", dot: "bg-amber-400", Icon: Loader2 },
  Ready: { pill: "text-violet-700 bg-violet-50 border border-violet-200", dot: "bg-violet-500", Icon: PackageCheck },
  Completed: { pill: "text-emerald-700 bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  Cancelled: { pill: "text-rose-700 bg-rose-50 border border-rose-200", dot: "bg-rose-500", Icon: XCircle },
};

export const FILTERS: Array<OrderStatus | "All"> = ["All", "New", "Preparing", "Ready", "Completed", "Cancelled"];