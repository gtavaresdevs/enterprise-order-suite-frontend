import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin } from "lucide-react";
import type { PaymentMethod, CardType } from "@/types/orders";
import { PaymentMethodPicker } from "@/components/payment/PaymentMethodPicker";

export const CheckoutFlow = ({ onBack, onPlaceOrder }: { onBack: () => void; onPlaceOrder: (method: PaymentMethod) => void }) => {
    const { t } = useTranslation("storefront");
    const { t: tPayment } = useTranslation("payment");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [cardType, setCardType] = useState<CardType | null>(null);
    const [changeFor, setChangeFor] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handlePlaceOrder = () => {
        setSubmitted(true);
        if (!paymentMethod) return;
        if (paymentMethod === "Card" && !cardType) return;
        onPlaceOrder(paymentMethod);
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col">
            <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 flex-shrink-0">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-slate-900 -ml-1">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[17px] font-semibold text-slate-900 ml-2">{t("checkout.title")}</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <section>
                    <h2 className="text-sm font-bold text-slate-900 mb-2 px-1">{t("checkout.deliveryAddressLabel")}</h2>
                    <div className="bg-white rounded-[8px] border border-slate-100 p-4 shadow-sm relative">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-slate-400"><MapPin className="w-5 h-5" /></div>
                            <div>
                                <p className="font-semibold text-slate-900">{t("checkout.customerName")}</p>
                                <p className="text-slate-600 text-sm mt-0.5">{t("checkout.addressLine1")}</p>
                            </div>
                        </div>
                    </div>
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
                                method: submitted && !paymentMethod ? tPayment("errors.methodRequired") : undefined,
                                cardType: submitted && paymentMethod === "Card" && !cardType ? tPayment("errors.cardTypeRequired") : undefined,
                            }}
                        />
                    </div>
                </section>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 pb-8">
                <button onClick={handlePlaceOrder} className="w-full h-[52px] bg-slate-950 text-slate-50 rounded-[8px] font-semibold text-[15px] hover:bg-slate-900">
                    {t("checkout.placeOrderButton")}
                </button>
            </div>
        </div>
    );
};
