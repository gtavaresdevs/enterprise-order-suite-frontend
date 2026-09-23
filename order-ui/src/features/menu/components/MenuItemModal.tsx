import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Package, Tag, Boxes, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFormat } from "@/features/preferences/hooks/useFormat";
import type { AddonOption, MenuItem, SizeOption } from "@/types/menu";

interface MenuItemModalProps {
    item?: MenuItem;
    categories: string[];
    onClose: () => void;
    onSubmit: (data: Omit<MenuItem, "id">) => void;
    isSubmitting?: boolean;
}

let tempIdCounter = 0;
const tempId = () => `tmp-${Date.now()}-${tempIdCounter++}`;

export function MenuItemModal({ item, categories, onClose, onSubmit, isSubmitting }: MenuItemModalProps) {
    const { t } = useTranslation("menu");
    const { currencySymbol } = useFormat();
    const isEditing = item !== undefined;
    const [name, setName] = useState(item?.name ?? "");
    const [desc, setDesc] = useState(item?.description ?? "");
    const [price, setPrice] = useState(item ? String(item.price) : "");
    const [category, setCat] = useState(item?.category ?? categories[0] ?? "");
    const [stockQuantity, setStockQuantity] = useState(item ? String(item.stockQuantity) : "0");
    const [available, setAvailable] = useState(item?.available ?? true);
    const [nameError, setNameError] = useState(false);
    const [sizes, setSizes] = useState<SizeOption[]>(item?.sizes ?? []);
    const [addons, setAddons] = useState<AddonOption[]>(item?.addons ?? []);

    const addSize = () => setSizes((prev) => [...prev, { id: tempId(), label: "", price: 0 }]);
    const removeSize = (id: string) => setSizes((prev) => prev.filter((s) => s.id !== id));
    const updateSize = (id: string, patch: Partial<SizeOption>) =>
        setSizes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    const addAddon = () => setAddons((prev) => [...prev, { id: tempId(), label: "", price: 0, maxQuantity: 1 }]);
    const removeAddon = (id: string) => setAddons((prev) => prev.filter((a) => a.id !== id));
    const updateAddon = (id: string, patch: Partial<AddonOption>) =>
        setAddons((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    const handleSubmit = () => {
        if (!name.trim()) {
            setNameError(true);
            return;
        }
        setNameError(false);
        const cleanSizes = sizes.filter((s) => s.label.trim());
        const cleanAddons = addons.filter((a) => a.label.trim());
        onSubmit({
            name,
            description: desc,
            price: parseFloat(price) || 0,
            category,
            image: item?.image ?? "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=480&h=320&fit=crop&auto=format",
            stockQuantity: parseInt(stockQuantity) || 0,
            available,
            sizes: cleanSizes.length > 0 ? cleanSizes : undefined,
            addons: cleanAddons.length > 0 ? cleanAddons : undefined,
        });
    };

    const inputCls = "rounded-[8px] h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10";

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-md max-h-[85vh] bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col overflow-hidden pointer-events-auto" onClick={(e) => e.stopPropagation()}>

                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 font-outfit">{isEditing ? t("modal.titleEdit") : t("modal.titleCreate")}</h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{isEditing ? t("modal.subtitleEdit") : t("modal.subtitleCreate")}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto fade-scrollbar">
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
                                        {categories.map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">{t("modal.priceLabel")}</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">{currencySymbol}</span>
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

                            <div className="col-span-2">
                                <div className="flex items-center justify-between mb-1.5">
                                    <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide font-mono">{t("modal.sizesLabel")}</Label>
                                    <button onClick={addSize} className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5">
                                        <Plus className="w-3 h-3" /> {t("modal.addSizeButton")}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {sizes.length === 0 && (
                                        <p className="text-xs text-slate-300">{t("modal.sizesEmpty")}</p>
                                    )}
                                    {sizes.length > 0 && (
                                        <div className="flex items-center gap-2 px-0.5">
                                            <span className="flex-1 text-[10px] font-medium text-slate-400 uppercase tracking-wide">{t("modal.columnLabel")}</span>
                                            <span className="w-24 text-[10px] font-medium text-slate-400 uppercase tracking-wide">{t("modal.columnPriceDelta")}</span>
                                            <span className="w-7 flex-shrink-0" />
                                        </div>
                                    )}
                                    {sizes.map((s) => (
                                        <div key={s.id} className="flex items-center gap-2">
                                            <Input
                                                placeholder={t("modal.sizeLabelPlaceholder")}
                                                value={s.label}
                                                onChange={(e) => updateSize(s.id, { label: e.target.value })}
                                                className={`flex-1 ${inputCls}`}
                                            />
                                            <div className="relative w-24">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 pointer-events-none">{currencySymbol}</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={s.price}
                                                    onChange={(e) => updateSize(s.id, { price: parseFloat(e.target.value) || 0 })}
                                                    className={`pl-6 font-mono ${inputCls}`}
                                                />
                                            </div>
                                            <button onClick={() => removeSize(s.id)} className="w-7 h-7 flex-shrink-0 rounded-[8px] flex items-center justify-center text-red-500 hover:bg-red-50">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <div className="flex items-center justify-between mb-1.5">
                                    <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide font-mono">{t("modal.addonsLabel")}</Label>
                                    <button onClick={addAddon} className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5">
                                        <Plus className="w-3 h-3" /> {t("modal.addAddonButton")}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {addons.length === 0 && (
                                        <p className="text-xs text-slate-300">{t("modal.addonsEmpty")}</p>
                                    )}
                                    {addons.length > 0 && (
                                        <div className="flex items-center gap-2 px-0.5">
                                            <span className="flex-1 text-[10px] font-medium text-slate-400 uppercase tracking-wide">{t("modal.columnLabel")}</span>
                                            <span className="w-20 text-[10px] font-medium text-slate-400 uppercase tracking-wide">{t("modal.columnPrice")}</span>
                                            <span className="w-16 text-[10px] font-medium text-slate-400 uppercase tracking-wide">{t("modal.columnMaxQuantity")}</span>
                                            <span className="w-7 flex-shrink-0" />
                                        </div>
                                    )}
                                    {addons.map((a) => (
                                        <div key={a.id} className="flex items-center gap-2">
                                            <Input
                                                placeholder={t("modal.addonLabelPlaceholder")}
                                                value={a.label}
                                                onChange={(e) => updateAddon(a.id, { label: e.target.value })}
                                                className={`flex-1 ${inputCls}`}
                                            />
                                            <div className="relative w-20">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 pointer-events-none">{currencySymbol}</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={a.price}
                                                    onChange={(e) => updateAddon(a.id, { price: parseFloat(e.target.value) || 0 })}
                                                    className={`pl-6 font-mono ${inputCls}`}
                                                />
                                            </div>
                                            <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                title={t("modal.addonMaxQuantityLabel")}
                                                value={a.maxQuantity ?? 1}
                                                onChange={(e) => updateAddon(a.id, { maxQuantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                                className={`w-16 font-mono ${inputCls}`}
                                            />
                                            <button onClick={() => removeAddon(a.id)} className="w-7 h-7 flex-shrink-0 rounded-[8px] flex items-center justify-center text-red-500 hover:bg-red-50">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 rounded-b-[8px] flex-shrink-0">
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
