import { useKdsOrders } from '../hooks/useKdsOrders';
import { useUpdateKdsStatus } from '../hooks/useUpdateKdsStatus';
import { KdsTicket } from './KdsTicket';

export const KdsFeature = () => {
    const { data: tickets, isLoading } = useKdsOrders();
    const mutation = useUpdateKdsStatus();

    if (isLoading) return <div className="p-8 text-slate-400">Loading KDS...</div>;

    return (
        <div className="flex flex-wrap gap-6 items-start p-6">
            {tickets?.map((ticket) => (
                <KdsTicket
                    key={ticket.id}
                    ticket={ticket}
                    onItemToggle={(itemId, completed) =>
                        mutation.mutate({ ticketId: ticket.id, itemId, completed })
                    }
                />
            ))}
        </div>
    );
};