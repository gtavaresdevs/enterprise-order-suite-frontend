import { useState } from "react";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import type { CartItem, MenuItem } from "@/types/storefront";

export const BottomSheet = ({
    item,
    onClose,
    onAddToCart,
}: {
    item: MenuItem;
    onClose: () => void;
    onAddToCart: (item: CartItem) => void;
}) => {
    const [selectedSize, setSelectedSize] = useState(item.sizes?.[0]?.id ?? null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);

    const fmt = (n: number) => n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;

    const sizePrice = item.sizes?.find((s) => s.id === selectedSize)?.price ?? 0;
    const addonPrice = selectedAddons.reduce((s, id) => {
        const addon = item.addons?.find((a) => a.id === id);
        return s + (addon?.price ?? 0);
    }, 0);
    const unitPrice = item.price + sizePrice + addonPrice;
    const total = unitPrice * quantity;

    const toggleAddon = (id: string) => {
        setSelectedAddons((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    return (
        <>
            <div className="absolute inset-0 bg-slate-950/50 z-40" onClick={onClose} />
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl overflow-hidden max-h-[85%] flex flex-col">
                <div className="relative h-44 flex-shrink-0 bg-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <ChevronLeft className="w-4 h-4 text-slate-700" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.name}</h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    {item.sizes && item.sizes.length > 0 && (
                        <div className="px-4 py-4 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Size</p>
                            <div className="space-y-2">
                                {item.sizes.map((size) => (
                                    <label key={size.id} className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedSize === size.id ? "border-slate-950 bg-slate-950" : "border-slate-300"}`}>
                                                {selectedSize === size.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-sm ${selectedSize === size.id ? "font-medium" : ""}`}>{size.label}</span>
                                        </div>
                                        {size.price !== 0 && <span className="font-mono text-xs text-slate-500">{fmt(size.price)}</span>}
                                        <input type="radio" className="hidden" checked={selectedSize === size.id} onChange={() => setSelectedSize(size.id)} />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.addons && item.addons.length > 0 && (
                        <div className="px-4 py-4">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Add-ons</p>
                            <div className="space-y-2">
                                {item.addons.map((addon) => {
                                    const checked = selectedAddons.includes(addon.id);
                                    return (
                                        <label key={addon.id} className="flex items-center justify-between cursor-pointer group" onClick={() => toggleAddon(addon.id)}>
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-slate-950 bg-slate-950" : "border-slate-300"}`}>
                                                    {checked && <div className="w-2.5 h-2.5 text-white">✓</div>}
                                                </div>
                                                <span className={`text-sm ${checked ? "font-medium" : ""}`}>{addon.label}</span>
                                            </div>
                                            <span className="font-mono text-xs text-emerald-600 font-medium">+${addon.price.toFixed(2)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-4 py-4 border-t border-slate-100 bg-white flex-shrink-0">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-[8px] border border-slate-200 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                        <span className="font-mono text-lg font-semibold w-6 text-center">{quantity}</span>
                        <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 rounded-[8px] bg-slate-950 text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => { onAddToCart({ menuId: item.id, name: item.name, price: unitPrice, quantity }); onClose(); }} className="w-full h-12 rounded-[8px] bg-slate-950 text-white font-semibold flex items-center justify-between px-4">
                        <span>Add to Cart</span>
                        <span className="font-mono">${total.toFixed(2)}</span>
                    </button>
                </div>
            </div>
        </>
    );
};