import type { KdsTicket, KdsSummaryItem } from '@/types/kds';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_SUMMARY: KdsSummaryItem[] = [
  { qty: 12, name: "Smash Patties" },
  { qty: 8, name: "Truffle Fries" },
  { qty: 3, name: "Spicy Chicken Breasts" },
  { qty: 2, name: "Vegan Patties" },
  { qty: 5, name: "Brioche Buns" },
];

// Mock data internal to this service file to prevent dependency leaking
let mockTickets: KdsTicket[] = [
  {
    id: "#ORD-8802",
    customer: "Marcus T.",
    type: "DELIVERY",
    status: "preparing",
    isRush: true,
    timer: "18:30",
    timerState: "late", // rose pill
    isActive: true, // gets the glowing border
    items: [
      {
        id: "itm-1",
        qty: 1,
        name: "Double Smash Burger",
        completed: true,
        modifiers: [
          { name: "NO ONION", color: "text-red-400" },
          { name: "EXTRA BACON", color: "text-emerald-400" }
        ]
      },
      {
        id: "itm-2",
        qty: 2,
        name: "Truffle Fries",
        completed: false,
        modifiers: []
      }
    ]
  },
  {
    id: "#ORD-8803",
    customer: "Walk-in #42",
    type: "DINE-IN",
    status: "pending",
    isRush: false,
    timer: "04:12",
    timerState: "good", // emerald pill
    isActive: false,
    items: [
      {
        id: "itm-3",
        qty: 1,
        name: "Spicy Chicken Sandwich",
        completed: false,
        modifiers: [
          { name: "SAUCE ON SIDE", color: "text-slate-300" }
        ]
      },
      {
        id: "itm-4",
        qty: 1,
        name: "Sweet Potato Fries",
        completed: false,
        modifiers: []
      }
    ]
  },
  {
    id: "#ORD-8804",
    customer: "UberEats - 1A3F",
    type: "DELIVERY",
    status: "ready",
    isRush: false,
    timer: "08:15",
    timerState: "good",
    isActive: false,
    items: [
      {
        id: "itm-5",
        qty: 3,
        name: "Classic Cheeseburger",
        completed: true,
        modifiers: []
      },
      {
        id: "itm-6",
        qty: 3,
        name: "Large Fries",
        completed: true,
        modifiers: []
      }
    ]
  }
];

export const getKdsTickets = async (): Promise<KdsTicket[]> => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockTickets];
};

export const getKdsSummary = async (): Promise<KdsSummaryItem[]> => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...MOCK_SUMMARY];
};

export const updateTicketStatus = async (
    ticketId: string,
    itemId: string,
    completed: boolean
): Promise<void> => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    mockTickets = mockTickets.map((ticket) => {
        if (ticket.id === ticketId) {
            return {
                ...ticket,
                items: ticket.items.map((item) =>
                    item.id === itemId ? { ...item, completed } : item
                ),
            };
        }
        return ticket;
    });
};