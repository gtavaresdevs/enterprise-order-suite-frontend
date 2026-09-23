import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { trackOrderService } from "../services/trackOrder.service";
import { normalizePhone } from "@/utils/whatsapp";
import { KDS_POLLING_INTERVAL } from "@/features/kds/constants/kds.constants";

export const useTrackOrder = () => {
    const [searchParams] = useSearchParams();
    const urlOrderId = searchParams.get("order") ?? "";
    const urlPhone = searchParams.get("phone") ?? "";

    const [orderIdInput, setOrderIdInput] = useState(urlOrderId);
    const [phoneInput, setPhoneInput] = useState(urlPhone);
    const [lookup, setLookup] = useState<{ orderId: string; phone: string } | null>(
        urlOrderId && urlPhone ? { orderId: urlOrderId, phone: urlPhone } : null
    );

    const { data: orders = [], isLoading, isFetched } = useQuery({
        queryKey: ["orders"],
        queryFn: trackOrderService.getOrders,
        enabled: !!lookup,
        refetchInterval: KDS_POLLING_INTERVAL,
    });

    const order = lookup
        ? orders.find((o) => o.id === lookup.orderId && normalizePhone(o.customerPhone) === normalizePhone(lookup.phone)) ?? null
        : null;

    const submitLookup = () => {
        if (orderIdInput.trim() && phoneInput.trim()) {
            setLookup({ orderId: orderIdInput.trim(), phone: phoneInput.trim() });
        }
    };

    return {
        orderIdInput,
        setOrderIdInput,
        phoneInput,
        setPhoneInput,
        submitLookup,
        order,
        isLoading: !!lookup && isLoading,
        notFound: !!lookup && isFetched && !isLoading && !order,
        hasSearched: !!lookup,
    };
};
