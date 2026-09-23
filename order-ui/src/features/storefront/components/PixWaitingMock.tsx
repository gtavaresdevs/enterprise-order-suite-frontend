import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Loader2 } from "lucide-react";

const MOCK_PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136mock-pix-code-0000-0000-0000000000005204000053039865405 0.005802BR5910RESTAURANTE6009SAOPAULO62070503***6304ABCD";
const AUTO_CONFIRM_MS = 2800;

export const PixWaitingMock = ({ onConfirmed }: { onConfirmed: () => void }) => {
    const { t } = useTranslation("storefront");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const timer = setTimeout(onConfirmed, AUTO_CONFIRM_MS);
        return () => clearTimeout(timer);
    }, [onConfirmed]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(MOCK_PIX_CODE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard permission denied by the browser — nothing to recover here.
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-5">
                <QRCodeCanvas value={MOCK_PIX_CODE} size={180} />
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-5">{t("pixWaiting.title")}</p>
            <button onClick={handleCopy} className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors max-w-full">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{copied ? t("pixWaiting.copied") : t("pixWaiting.copyCodeButton")}</span>
            </button>
            <div className="flex items-center gap-2 mt-6 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">{t("pixWaiting.waitingMessage")}</span>
            </div>
        </div>
    );
};
