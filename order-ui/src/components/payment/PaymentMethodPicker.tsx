import { useTranslation } from "react-i18next";
import { QrCode, CreditCard, Banknote } from "lucide-react";
import type { PaymentMethod, CardType } from "@/types/orders";

interface PaymentMethodPickerProps {
    value: PaymentMethod | null;
    onValueChange: (method: PaymentMethod) => void;
    cardType: CardType | null;
    onCardTypeChange: (type: CardType) => void;
    changeFor: string;
    onChangeForChange: (value: string) => void;
    errors?: { method?: string; cardType?: string };
}

const METHODS: PaymentMethod[] = ["PIX", "Card", "Cash"];
const CARD_TYPES: CardType[] = ["Credit", "Debit"];

const METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
    PIX: QrCode,
    Card: CreditCard,
    Cash: Banknote,
};

export function PaymentMethodPicker({ value, onValueChange, cardType, onCardTypeChange, changeFor, onChangeForChange, errors }: PaymentMethodPickerProps) {
    const { t } = useTranslation("payment");

    return (
        <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("methodLabel")}</p>
            <div className="grid grid-cols-3 gap-2">
                {METHODS.map((method) => {
                    const Icon = METHOD_ICONS[method];
                    const selected = value === method;
                    return (
                        <button
                            key={method}
                            type="button"
                            onClick={() => onValueChange(method)}
                            className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-[8px] border text-xs font-medium transition-colors ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                        >
                            <Icon className="w-4 h-4" />
                            {t(`methods.${method}`)}
                        </button>
                    );
                })}
            </div>
            {errors?.method && <p className="text-xs text-red-500 mt-1.5">{errors.method}</p>}

            {value === "Card" && (
                <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("cardTypeLabel")}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {CARD_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => onCardTypeChange(type)}
                                className={`h-9 rounded-[8px] border text-sm font-medium transition-colors ${cardType === type ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                            >
                                {t(`cardTypes.${type}`)}
                            </button>
                        ))}
                    </div>
                    {errors?.cardType && <p className="text-xs text-red-500 mt-1.5">{errors.cardType}</p>}
                </div>
            )}

            {value === "Cash" && (
                <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("changeForLabel")}</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("changeForPlaceholder")}
                        value={changeFor}
                        onChange={(e) => onChangeForChange(e.target.value)}
                        className="w-full h-9 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">{t("changeForHint")}</p>
                </div>
            )}
        </div>
    );
}
