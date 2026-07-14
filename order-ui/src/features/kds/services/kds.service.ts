import type { KdsTicket } from '@/types/kds';

// Mock data internal to this service file to prevent dependency leaking
let mockTickets: KdsTicket[] = [
    {
        id: "TKT-001",
        customer: "John Doe",
        type: 'DINE-IN',
        isRush: true,
        timer: "04:20",
        timerState: 'good',
        isActive: true,
        items: [
            { id: "itm-1", qty: 1, name: "Double Cheeseburger", completed: true },
            { id: "itm-2", qty: 2, name: "Large Fries", completed: false },
        ],
    },
    {
        id: "TKT-002",
        customer: "Jane Smith",
        type: 'DELIVERY',
        isRush: false,
        timer: "12:45",
        timerState: 'late',
        isActive: true,
        items: [
            { id: "itm-3", qty: 1, name: "Chicken Sandwich", completed: false },
        ],
    },
];

export const getKdsTickets = async (): Promise<KdsTicket[]> => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockTickets];
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