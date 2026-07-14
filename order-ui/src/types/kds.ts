export type TicketStatus = 'pending' | 'preparing' | 'ready';

export interface Modifier {
    name: string;
    color?: string;
}

export interface TicketItem {
    id: string;
    qty: number;
    name: string;
    completed: boolean;
    modifiers?: Modifier[];
}

export interface KdsTicket {
    id: string;
    customer: string;
    type: 'DELIVERY' | 'DINE-IN' | 'PICKUP';
    isRush: boolean;
    timer: string;
    timerState: 'good' | 'late';
    isActive: boolean;
    items: TicketItem[];
}

export interface KdsSummaryItem {
    qty: number;
    name: string;
}