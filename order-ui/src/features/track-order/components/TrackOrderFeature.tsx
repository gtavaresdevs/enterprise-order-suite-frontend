import { useTranslation } from "react-i18next";
import { Search, Clock, PackageCheck, CheckCircle2, XCircle, Loader2, MapPin } from "lucide-react";
import type { OrderStatus } from "@/types/orders";
import { useTrackOrder } from "../hooks/useTrackOrder";

const STEPS: OrderStatus[] = ["New", "Preparing", "Ready", "Completed"];
const STEP_ICON: Record<OrderStatus, React.ElementType> = {
    New: Clock,
    Preparing: Loader2,
    Ready: PackageCheck,
    Completed: CheckCircle2,
    Cancelled: XCircle,
};

export const TrackOrderFeature = () => {
    const { t } = useTranslation("trackOrder");
    const { orderIdInput, setOrderIdInput, phoneInput, setPhoneInput, submitLookup, order, isLoading, notFound } = useTrackOrder();

    return (
        <div className="min-h-screen flex items-start justify-center py-8 px-4 bg-[#f8fafc] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]">
            <div className="relative w-full bg-white overflow-hidden shadow-2xl shadow-slate-900/25 flex flex-col" style={{ maxWidth: 420, minHeight: "60vh", borderRadius: 32, border: "1px solid rgba(15,23,42,0.1)" }}>
                <div className="px-6 py-6 border-b border-slate-100">
                    <h1 className="text-lg font-bold text-slate-900">{t("title")}</h1>
                    <p className="text-xs text-slate-400 mt-1">{t("subtitle")}</p>
                </div>

                {!order && (
                    <div className="px-6 py-6 space-y-3">
                        <input
                            className="w-full h-10 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400"
                            placeholder={t("orderIdPlaceholder")}
                            value={orderIdInput}
                            onChange={(e) => setOrderIdInput(e.target.value)}
                        />
                        <input
                            className="w-full h-10 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400"
                            placeholder={t("phonePlaceholder")}
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                        />
                        <button onClick={submitLookup} className="w-full h-10 rounded-[8px] bg-slate-950 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800">
                            <Search className="w-3.5 h-3.5" /> {t("lookupButton")}
                        </button>
                        {isLoading && <p className="text-xs text-slate-400 text-center">{t("loading")}</p>}
                        {notFound && <p className="text-xs text-red-500 text-center">{t("notFound")}</p>}
                    </div>
                )}

                {order && (
                    <div className="px-6 py-6 space-y-6">
                        <div>
                            <p className="text-xs text-slate-400 font-mono">{t("orderIdLabel", { id: order.id })}</p>
                            {order.etaMinutes != null && order.status !== "Completed" && order.status !== "Cancelled" && (
                                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t("etaLabel", { count: order.etaMinutes })}</p>
                            )}
                            {order.deliveryZone && (
                                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {order.deliveryZone}</p>
                            )}
                        </div>

                        {order.status === "Cancelled" ? (
                            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-[8px] px-4 py-3">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">{t("cancelled")}</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {STEPS.map((step, idx) => {
                                    const currentIdx = STEPS.indexOf(order.status);
                                    const isDone = idx <= currentIdx;
                                    const Icon = STEP_ICON[step];
                                    return (
                                        <div key={step} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-300"}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-sm font-medium ${isDone ? "text-slate-900" : "text-slate-300"}`}>{t(`steps.${step}`)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{t("itemsLabel")}</p>
                            <ul className="space-y-1">
                                {order.items.map((line, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">{line.quantity}x {line.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
