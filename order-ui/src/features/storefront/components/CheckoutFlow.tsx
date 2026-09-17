import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User, Phone, MapPin, Clock } from "lucide-react";
import type { DeliveryZone, Fulfillment, PaymentMethod, CardType } from "@/types/orders";
import type { PlaceOrderInput } from "@/types/storefront";
import { PaymentMethodPicker } from "@/components/payment/PaymentMethodPicker";
import { PICKUP_ETA_MINUTES } from "../constants/storefront.constants";

interface CheckoutFlowProps {
    zones: DeliveryZone[];
    isPlacingOrder: boolean;
    onBack: () => void;
    onPlaceOrder: (input: PlaceOrderInput) => void;
}

export const CheckoutFlow = ({ zones, isPlacingOrder, onBack, onPlaceOrder }: CheckoutFlowProps) => {
    const { t } = useTranslation("storefront");
    const { t: tPayment } = useTranslation("payment");
    const activeZones = zones.filter((z) => z.active);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [fulfillment, setFulfillment] = useState<Fulfillment>(activeZones.length > 0 ? "Delivery" : "Pickup");
    const [zoneId, setZoneId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [cardType, setCardType] = useState<CardType | null>(null);
    const [changeFor, setChangeFor] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const selectedZone = activeZones.find((z) => z.id === zoneId) ?? null;
    const etaMinutes = fulfillment === "Delivery" ? (selectedZone?.etaMinutes ?? null) : PICKUP_ETA_MINUTES;

    function validate() {
        const e: Record<string, string> = {};
        if (!customerName.trim()) e.customerName = t("checkout.errors.nameRequired");
        if (!customerPhone.trim()) e.customerPhone = t("checkout.errors.phoneRequired");
        if (fulfillment === "Delivery" && !zoneId) e.zone = t("checkout.errors.zoneRequired");
        if (!paymentMethod) e.paymentMethod = tPayment("errors.methodRequired");
        if (paymentMethod === "Card" && !cardType) e.cardType = tPayment("errors.cardTypeRequired");
        return e;
    }

    const handlePlaceOrder = () => {
        setSubmitted(true);
        const e = validate();
        if (Object.keys(e).length > 0) return;
        onPlaceOrder({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            fulfillment,
            deliveryZone: fulfillment === "Delivery" ? (selectedZone ?? undefined) : undefined,
            paymentMethod: paymentMethod as PaymentMethod,
            cardType: cardType ?? undefined,
            changeFor: parseFloat(changeFor) > 0 ? parseFloat(changeFor) : undefined,
        });
    };

    const errors = submitted ? validate() : {};
    const inputCls = (err?: string) => `w-full h-10 px-3 rounded-[8px] border text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-slate-950/10 ${err ? "border-red-300 bg-red-50/40" : "border-slate-200 bg-slate-50 focus:border-slate-400"}`;

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col">
            <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 flex-shrink-0">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-slate-900 -ml-1">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[17px] font-semibold text-slate-900 ml-2">{t("checkout.title")}</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <section className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-4 space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 mb-1">{t("checkout.yourDetailsLabel")}</h2>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("checkout.nameLabel")}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input className={`${inputCls(errors.customerName)} pl-8`} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("checkout.namePlaceholder")} />
                        </div>
                        {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("checkout.phoneLabel")}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input className={`${inputCls(errors.customerPhone)} pl-8`} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={t("checkout.phonePlaceholder")} />
                        </div>
                        {errors.customerPhone && <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>}
                        <p className="text-[10px] text-slate-400 mt-1">{t("checkout.phoneHint")}</p>
                    </div>
                </section>

                <section className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-4 space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 mb-1">{t("checkout.fulfillmentLabel")}</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setFulfillment("Pickup")}
                            className={`h-10 rounded-[8px] text-sm font-medium border transition-colors ${fulfillment === "Pickup" ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                            {t("checkout.fulfillmentPickup")}
                        </button>
                        <button
                            onClick={() => activeZones.length > 0 && setFulfillment("Delivery")}
                            disabled={activeZones.length === 0}
                            className={`h-10 rounded-[8px] text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${fulfillment === "Delivery" ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                        >
                            {t("checkout.fulfillmentDelivery")}
                        </button>
                    </div>
                    {activeZones.length === 0 && (
                        <p className="text-xs text-amber-600">{t("checkout.noZonesAvailable")}</p>
                    )}

                    {fulfillment === "Delivery" && activeZones.length > 0 && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("checkout.zoneLabel")}</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <select className={`${inputCls(errors.zone)} pl-8 cursor-pointer`} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                                    <option value="">{t("checkout.zonePlaceholder")}</option>
                                    {activeZones.map((z) => (
                                        <option key={z.id} value={z.id}>{z.neighborhood} — ${z.feeAmount.toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.zone && <p className="text-xs text-red-500 mt-1">{errors.zone}</p>}
                        </div>
                    )}

                    {etaMinutes != null && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" /> {t("checkout.etaEstimate", { count: etaMinutes })}
                        </div>
                    )}
                </section>

                <section>
                    <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-4">
                        <PaymentMethodPicker
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                            cardType={cardType}
                            onCardTypeChange={setCardType}
                            changeFor={changeFor}
                            onChangeForChange={setChangeFor}
                            errors={{
                                method: errors.paymentMethod,
                                cardType: errors.cardType,
                            }}
                        />
                    </div>
                </section>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 pb-8">
                <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full h-[52px] bg-slate-950 text-slate-50 rounded-[8px] font-semibold text-[15px] hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isPlacingOrder ? t("checkout.placingOrderButton") : t("checkout.placeOrderButton")}
                </button>
            </div>
        </div>
    );
};
