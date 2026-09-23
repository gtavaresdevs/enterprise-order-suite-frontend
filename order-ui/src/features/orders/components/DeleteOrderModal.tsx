import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import type { Order } from "@/types/orders";

export function DeleteOrderModal({ order, onConfirm, onCancel }: { order: Order; onConfirm: () => void; onCancel: () => void }) {
    const { t } = useTranslation("orders");
    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50" onClick={onCancel} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white rounded-[8px] border border-slate-200 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="px-6 py-5 border-b border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-[8px] bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">{t("deleteModal.title")}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{t("deleteModal.description", { status: t("status.cancelled") })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <p className="text-sm text-slate-600">{t("deleteModal.confirmMessage", { orderId: order.id, customerName: order.customerName })}</p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                        <button onClick={onCancel} className="h-8 px-4 rounded-[8px] border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">{t("deleteModal.keepButton")}</button>
                        <button onClick={onConfirm} className="h-8 px-4 rounded-[8px] bg-red-600 text-white text-sm font-semibold border border-red-700/50 hover:bg-red-700 transition-colors">{t("deleteModal.confirmButton")}</button>
                    </div>
                </div>
            </div>
        </>
    );
}