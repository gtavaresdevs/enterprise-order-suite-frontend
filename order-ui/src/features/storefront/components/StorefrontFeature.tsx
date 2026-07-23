import { Star } from "lucide-react";
import { useStorefront } from "../hooks/useStorefront";
import { CATEGORIES } from "../constants/storefront.constants";
import { MenuCard } from "./MenuCard";
import { BottomSheet } from "./BottomSheet";
import { CartOverlay } from "./CartOverlay";
import { CheckoutFlow } from "./CheckoutFlow";
import { SuccessView } from "./SuccessView";
import { MENU } from "../constants/storefront.constants";

export const StorefrontFeature = () => {
    const {
        activeCategory, setActiveCategory, selectedItem, setSelectedItem,
        cart, setCart, cartTotal, cartCount, flowState, setFlowState, addToCart
    } = useStorefront();

    const visibleMenu = MENU.filter((item) => item.category === activeCategory);

    return (
        <div className="min-h-screen flex items-start justify-center py-8 px-4 bg-[#f8fafc] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]">
            <div className="relative w-full bg-white overflow-hidden shadow-2xl shadow-slate-900/25 flex flex-col" style={{ maxWidth: 390, minHeight: "85vh", borderRadius: 32, border: "1px solid rgba(15,23,42,0.1)" }}>

                {/* Banner */}
                <div className="relative h-40 flex-shrink-0 bg-slate-900">
                    <img src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=320&fit=crop&auto=format" alt="Banner" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4">
                        <p className="text-sm font-bold text-white">The Urban Grill</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-white/80"><Star className="w-2.5 h-2.5 fill-amber-400 inline" /> 4.8</span>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex-shrink-0 bg-white border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                        {CATEGORIES.map((cat) => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium ${activeCategory === cat ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto pb-24">
                    <div className="px-4 pt-4 space-y-3">
                        {visibleMenu.map((item) => <MenuCard key={item.id} item={item} onSelect={() => setSelectedItem(item)} />)}
                    </div>
                </div>

                {/* Cart FAB */}
                {cartCount > 0 && flowState === "feed" && (
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-white via-white to-transparent z-30">
                        <button onClick={() => setFlowState("cart")} className="w-full h-14 rounded-[8px] bg-slate-950 text-white font-semibold flex items-center justify-between px-5">
                            <span>View Cart ({cartCount})</span>
                            <span className="font-mono">${cartTotal.toFixed(2)}</span>
                        </button>
                    </div>
                )}

                {/* Dynamic Views */}
                {selectedItem && flowState === "feed" && (
                    <BottomSheet item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
                )}
                {flowState === "cart" && <CartOverlay cart={cart} total={cartTotal} onClose={() => setFlowState("feed")} onCheckout={() => setFlowState("checkout")} />}
                {flowState === "checkout" && <CheckoutFlow onBack={() => setFlowState("cart")} onComplete={() => setFlowState("success")} />}
                {flowState === "success" && <SuccessView onBack={() => { setCart([]); setFlowState("feed"); }} />}
            </div>
        </div>
    );
};