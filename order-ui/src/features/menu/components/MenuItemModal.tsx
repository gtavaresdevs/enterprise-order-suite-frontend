import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Package, Tag, DollarSign, Boxes } from "lucide-react";
import { CATEGORIES } from "../constants/menu.constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { MenuItem } from "@/types/menu";

interface MenuItemModalProps {
    item?: MenuItem;
    onClose: () => void;
    onSubmit: (data: Omit<MenuItem, "id">) => void;
    isSubmitting?: boolean;
}

export function MenuItemModal({ item, onClose, onSubmit, isSubmitting }: MenuItemModalProps) {
    const { t } = useTranslation("menu");
    const isEditing = item !== undefined;
    const [name, setName] = useState(item?.name ?? "");
    const [desc, setDesc] = useState(item?.description ?? "");
    const [price, setPrice] = useState(item ? String(item.price) : "");
    const [category, setCat] = useState(item?.category ?? CATEGORIES[1]);
    const [stockQuantity, setStockQuantity] = useState(item ? String(item.stockQuantity) : "0");
    const [available, setAvailable] = useState(item?.available ?? true);
    const [nameError, setNameError] = useState(false);

    const handleSubmit = () => {
        if (!name.trim()) {
            setNameError(true);
            return;
        }
        setNameError(false);
        onSubmit({
            name,
            description: desc,
            price: parseFloat(price) || 0,
            category,
            image: item?.image ?? "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&auto=format",
            stockQuantity: parseInt(stockQuantity) || 0,
            available,
            sizes: item?.sizes,
            addons: item?.addons,
        });
    };

    const inputCls = "rounded-[8px] h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10";

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-md bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>

                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 font-outfit">{isEditing ? t("modal.titleEdit") : t("modal.titleCreate")}</h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{isEditing ? t("modal.subtitleEdit") : t("modal.subtitleCreate")}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        <div>
                            <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.photoLabel")}</Label>
                            <div className="h-32 rounded-[8px] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all">
                                <Package className="w-6 h-6 text-slate-300" />
                                <p className="text-xs text-slate-400">{t("modal.photoUploadHint")}</p>
                                <p className="text-[10px] text-slate-300 font-mono">{t("modal.photoFormatHint")}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.nameLabel")}</Label>
                                <Input
                                    placeholder={t("modal.namePlaceholder")}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (nameError) setNameError(false);
                                    }}
                                    className={inputCls}
                                />
                                {nameError && (
                                    <p className="text-xs text-red-500 mt-1">{t("modal.errors.nameRequired")}</p>
                                )}
                            </div>

                            <div>
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.categoryLabel")}</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <select
                                        className="w-full h-9 pl-8 pr-8 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition-all appearance-none cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCat(e.target.value)}
                                    >
                                        {CATEGORIES.filter((c) => c !== "All").map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.priceLabel")}</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className={`pl-8 font-mono ${inputCls}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.stockQuantityLabel")}</Label>
                                <div className="relative">
                                    <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        value={stockQuantity}
                                        onChange={(e) => setStockQuantity(e.target.value)}
                                        className={`pl-8 font-mono ${inputCls}`}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center justify-between rounded-[8px] border border-slate-200 bg-slate-50 px-3 h-9">
                                <span className="text-xs font-medium text-slate-600">{t("modal.availableToggleLabel")}</span>
                                <Switch checked={available} onCheckedChange={setAvailable} />
                            </div>

                            <div className="col-span-2">
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.descriptionLabel")}</Label>
                                <Textarea
                                    rows={3}
                                    placeholder={t("modal.descriptionPlaceholder")}
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10 resize-none"
                                />
                            </div>
                        </div>
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
                            {isSubmitting ? t("modal.savingButton") : isEditing ? t("modal.saveChangesButton") : t("modal.addToMenuButton")}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
