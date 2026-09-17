import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPinned, Plus, Trash2 } from "lucide-react";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import type { DeliveryZone } from "@/types/orders";

function makeZoneId(): string {
    return `zone-${Math.random().toString(36).slice(2, 9)}`;
}

export function DeliveryZonesSection() {
    const { t } = useTranslation("preferences");
    const { preferences, updatePreference } = usePreferencesContext();
    const { deliveryZones } = preferences;

    const [neighborhood, setNeighborhood] = useState("");
    const [feeAmount, setFeeAmount] = useState("");
    const [etaMinutes, setEtaMinutes] = useState("");
    const [error, setError] = useState<string | null>(null);

    const inputCls = "w-full h-9 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition-all";

    const handleAdd = () => {
        const trimmed = neighborhood.trim();
        const fee = parseFloat(feeAmount);
        const eta = parseInt(etaMinutes, 10);
        if (!trimmed) { setError(t("deliveryZonesSection.errors.nameRequired")); return; }
        if (!Number.isFinite(fee) || fee < 0) { setError(t("deliveryZonesSection.errors.feeInvalid")); return; }
        if (!Number.isFinite(eta) || eta <= 0) { setError(t("deliveryZonesSection.errors.etaInvalid")); return; }
        setError(null);
        const zone: DeliveryZone = { id: makeZoneId(), neighborhood: trimmed, feeAmount: fee, etaMinutes: eta, active: true };
        updatePreference("deliveryZones", [...deliveryZones, zone]);
        setNeighborhood(""); setFeeAmount(""); setEtaMinutes("");
    };

    const handleRemove = (id: string) => {
        updatePreference("deliveryZones", deliveryZones.filter((z) => z.id !== id));
    };

    const handleToggleActive = (id: string) => {
        updatePreference("deliveryZones", deliveryZones.map((z) => z.id === id ? { ...z, active: !z.active } : z));
    };

    return (
        <div className="bg-white rounded-[8px] border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-slate-950 flex items-center justify-center flex-shrink-0">
                    <MapPinned className="w-4 h-4 text-slate-100" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800">{t("deliveryZonesSection.title")}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t("deliveryZonesSection.description")}</p>
                </div>
            </div>

            <div className="px-5 py-5 space-y-4">
                {deliveryZones.length === 0 ? (
                    <p className="text-xs text-slate-400">{t("deliveryZonesSection.empty")}</p>
                ) : (
                    <div className="space-y-2">
                        {deliveryZones.map((zone) => (
                            <div key={zone.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-[8px] px-3 py-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <button
                                        onClick={() => handleToggleActive(zone.id)}
                                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0 ${zone.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400 border border-slate-200"}`}
                                    >
                                        {zone.active ? t("deliveryZonesSection.activeLabel") : t("deliveryZonesSection.inactiveLabel")}
                                    </button>
                                    <p className="text-sm font-medium text-slate-800 truncate">{zone.neighborhood}</p>
                                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">${zone.feeAmount.toFixed(2)} · {t("deliveryZonesSection.etaMinutesValue", { count: zone.etaMinutes })}</span>
                                </div>
                                <button onClick={() => handleRemove(zone.id)} className="w-7 h-7 flex-shrink-0 rounded-[6px] flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t border-slate-50 pt-4">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
                        <input className={inputCls} placeholder={t("deliveryZonesSection.namePlaceholder")} value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                        <input className={`${inputCls} w-24 font-mono`} type="number" min="0" step="0.01" placeholder={t("deliveryZonesSection.feePlaceholder")} value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
                        <input className={`${inputCls} w-24 font-mono`} type="number" min="1" step="1" placeholder={t("deliveryZonesSection.etaPlaceholder")} value={etaMinutes} onChange={(e) => setEtaMinutes(e.target.value)} />
                        <button onClick={handleAdd} className="h-9 px-3 rounded-[8px] bg-slate-950 text-slate-50 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors flex-shrink-0">
                            <Plus className="w-3.5 h-3.5" /> {t("deliveryZonesSection.addButton")}
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                </div>
            </div>
        </div>
    );
}
