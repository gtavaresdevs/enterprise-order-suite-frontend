import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Download, Trash2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { Table } from "@/types/tables";

interface TableCardProps {
    table: Table;
    onDelete: (id: string) => void;
}

export function TableCard({ table, onDelete }: TableCardProps) {
    const { t } = useTranslation("tables");
    const containerRef = useRef<HTMLDivElement>(null);
    const qrValue = `${window.location.origin}${table.qrCodeUrl}`;

    const handleDownload = () => {
        const canvas = containerRef.current?.querySelector("canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `${table.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="group bg-white rounded-[8px] border border-slate-100 overflow-hidden flex flex-col items-center p-5 transition-all hover:shadow-lg hover:shadow-slate-900/8 hover:-translate-y-0.5">
            <div ref={containerRef} className="p-3 bg-white rounded-[8px] border border-slate-100">
                <QRCodeCanvas value={qrValue} size={140} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mt-4 font-outfit">{table.name}</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-full">{qrValue}</p>
            <div className="flex items-center gap-2 mt-4 w-full">
                <button
                    onClick={handleDownload}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors"
                >
                    <Download className="w-3 h-3" /> {t("card.downloadButton")}
                </button>
                <button
                    onClick={() => onDelete(table.id)}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
