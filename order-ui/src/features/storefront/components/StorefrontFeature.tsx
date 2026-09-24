import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Star } from "lucide-react";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import { useFormat } from "@/features/preferences/hooks/useFormat";
import { useStorefront } from "../hooks/useStorefront";
import { MenuCard } from "./MenuCard";
import { BottomSheet } from "./BottomSheet";
import { CartOverlay } from "./CartOverlay";
import { CheckoutFlow } from "./CheckoutFlow";
import { PixWaitingMock } from "./PixWaitingMock";
import { SuccessView } from "./SuccessView";

export const StorefrontFeature = () => {
    const { t } = useTranslation("storefront");
    const {
        isLoading, sections, search, setSearch, selectedItem, setSelectedItem,
        cart, setCart, cartTotal, cartCount, flowState, setFlowState, addToCart,
        placeOrder, placedOrder, isPlacingOrder,
    } = useStorefront();

    const { preferences } = usePreferencesContext();
    const { formatCurrency } = useFormat();
    const { storefrontLogo, storefrontCover, storefrontBrandColor, deliveryZones } = preferences;

    // null = "All" (top of the menu). Chips scroll to their section instead of filtering; the active chip follows the scroll.
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        const onScroll = () => {
            const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
            let current: string | null = null;
            for (const [category, el] of Object.entries(sectionRefs.current)) {
                if (el && el.getBoundingClientRect().top <= headerBottom + 8) current = category;
            }
            setActiveCategory(current);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToCategory = (category: string | null) => {
        if (!category) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        const el = sectionRefs.current[category];
        if (!el) return;
        el.style.scrollMarginTop = `${headerRef.current?.offsetHeight ?? 0}px`;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const chipClass = (active: boolean) => `flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium ${active ? "text-white" : "bg-slate-100 text-slate-500"}`;
    const chipStyle = (active: boolean) => (active ? { backgroundColor: storefrontBrandColor } : undefined);

    return (
        <div className="min-h-screen flex items-start justify-center py-8 px-4 bg-[#f8fafc] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]">
            <div className="relative w-full bg-white overflow-clip shadow-2xl shadow-slate-900/25 flex flex-col" style={{ maxWidth: 390, minHeight: "85vh", borderRadius: 32, border: "1px solid rgba(15,23,42,0.1)" }}>

                {/* Banner */}
                <div className="relative h-40 flex-shrink-0 bg-slate-900">
                    <img
                        src={storefrontCover ?? "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=320&fit=crop&auto=format"}
                        alt={t("feed.bannerAlt")}
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    {storefrontLogo && (
                        <img
                            src={storefrontLogo}
                            alt={t("feed.logoAlt")}
                            className="absolute top-3 left-4 w-10 h-10 rounded-[8px] object-cover border-2 border-white shadow-md"
                        />
                    )}
                    <div className="absolute bottom-3 left-4">
                        <p className="text-sm font-bold text-white">{t("feed.businessName")}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-white/80"><Star className="w-2.5 h-2.5 fill-amber-400 inline" /> 4.8</span>
                        </div>
                    </div>
                </div>

                {/* Search + Categories */}
                <div ref={headerRef} className="flex-shrink-0 bg-white border-b border-slate-100 sticky top-0 z-20">
                    <div className="px-4 pt-3 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-1/2 translate-y-[-25%] pointer-events-none" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("feed.searchPlaceholder")}
                            aria-label={t("feed.searchPlaceholder")}
                            className="w-full h-9 pl-9 pr-3 rounded-full bg-slate-100 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                        <button onClick={() => scrollToCategory(null)} className={chipClass(activeCategory === null)} style={chipStyle(activeCategory === null)}>
                            {t("feed.allCategory")}
                        </button>
                        {sections.map(({ category }) => (
                            <button key={category} onClick={() => scrollToCategory(category)} className={chipClass(activeCategory === category)} style={chipStyle(activeCategory === category)}>
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto pb-24">
                    <div className="px-4 pt-4 space-y-6">
                        {isLoading ? (
                            <p className="text-xs text-slate-400 text-center py-8">{t("feed.loadingMenu")}</p>
                        ) : sections.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">{t("feed.noResults")}</p>
                        ) : (
                            sections.map(({ category, items }) => (
                                <section key={category} ref={(el) => { sectionRefs.current[category] = el; }} className="space-y-3">
                                    <h2 className="text-base font-semibold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{category}</h2>
                                    {items.map((item) => <MenuCard key={item.id} item={item} onSelect={() => setSelectedItem(item)} />)}
                                </section>
                            ))
                        )}
                    </div>
                </div>

                {/* Cart FAB */}
                {cartCount > 0 && flowState === "feed" && (
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-white via-white to-transparent z-30">
                        <button onClick={() => setFlowState("cart")} className="w-full h-14 rounded-[8px] text-white font-semibold flex items-center justify-between px-5" style={{ backgroundColor: storefrontBrandColor }}>
                            <span>{t("feed.viewCartButton", { count: cartCount })}</span>
                            <span className="font-mono">{formatCurrency(cartTotal)}</span>
                        </button>
                    </div>
                )}

                {/* Dynamic Views */}
                {selectedItem && flowState === "feed" && (
                    <BottomSheet item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
                )}
                {flowState === "cart" && <CartOverlay cart={cart} total={cartTotal} onClose={() => setFlowState("feed")} onCheckout={() => setFlowState("checkout")} />}
                {flowState === "checkout" && (
                    <CheckoutFlow
                        zones={deliveryZones}
                        isPlacingOrder={isPlacingOrder}
                        cartTotal={cartTotal}
                        onBack={() => setFlowState("cart")}
                        onPlaceOrder={(input) => {
                            placeOrder(input);
                            setFlowState(input.paymentMethod === "PIX" ? "pixWaiting" : "success");
                        }}
                    />
                )}
                {flowState === "pixWaiting" && <PixWaitingMock onConfirmed={() => setFlowState("success")} />}
                {flowState === "success" && <SuccessView order={placedOrder} onBack={() => { setCart([]); setFlowState("feed"); }} />}
            </div>
        </div>
    );
};