import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddTableModalProps {
    onClose: () => void;
    onSubmit: (name: string) => void;
    isSubmitting?: boolean;
}

export function AddTableModal({ onClose, onSubmit, isSubmitting }: AddTableModalProps) {
    const { t } = useTranslation("tables");
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState(false);

    const handleSubmit = () => {
        if (!name.trim()) {
            setNameError(true);
            return;
        }
        setNameError(false);
        onSubmit(name.trim());
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-sm bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 font-outfit">{t("modal.title")}</h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{t("modal.subtitle")}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="px-6 py-5">
                        <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.nameLabel")}</Label>
                        <div className="relative">
                            <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder={t("modal.namePlaceholder")}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (nameError) setNameError(false);
                                }}
                                className="pl-8 rounded-[8px] h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10"
                            />
                        </div>
                        {nameError && (
                            <p className="text-xs text-red-500 mt-1">{t("modal.errors.nameRequired")}</p>
                        )}
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 rounded-b-[8px]">
                        <Button variant="outline" onClick={onClose} className="rounded-[8px] h-9 border-slate-200 text-slate-600 hover:bg-slate-100">
                            {t("modal.cancelButton")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all"
                        >
                            {isSubmitting ? t("modal.addingButton") : t("modal.addButton")}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
