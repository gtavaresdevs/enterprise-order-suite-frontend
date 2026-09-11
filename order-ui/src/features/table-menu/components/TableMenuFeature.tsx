import { UtensilsCrossed } from "lucide-react";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";
import { useTableMenu } from "../hooks/useTableMenu";
import { PublicMenuItemCard } from "./PublicMenuItemCard";

export const TableMenuFeature = () => {
    const { table, tableId, categories, filteredItems, activeCategory, setActiveCategory, isLoading, isTableLoading } = useTableMenu();
    const { preferences } = usePreferencesContext();
    const { storefrontLogo, storefrontCover, storefrontBrandColor } = preferences;

    return (
        <div className="min-h-screen flex items-start justify-center py-8 px-4 bg-[#f8fafc] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px]">
            <div
                className="relative w-full bg-white overflow-hidden shadow-2xl shadow-slate-900/25 flex flex-col"
                style={{ maxWidth: 390, minHeight: "85vh", borderRadius: 32, border: "1px solid rgba(15,23,42,0.1)" }}
            >
                <div className="relative h-32 flex-shrink-0 bg-slate-900">
                    <img
                        src={storefrontCover ?? "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=320&fit=crop&auto=format"}
                        alt="Banner"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    {storefrontLogo && (
                        <img
                            src={storefrontLogo}
                            alt="Store logo"
                            className="absolute top-3 left-4 w-10 h-10 rounded-[8px] object-cover border-2 border-white shadow-md"
                        />
                    )}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-white/80" />
                        <p className="text-sm font-bold text-white">
                            {table ? table.name : tableId && !isTableLoading ? "Table not found" : "Menu"}
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0 bg-white border-b border-slate-100 sticky top-0 z-20">
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium ${activeCategory === cat ? "text-white" : "bg-slate-100 text-slate-500"}`}
                                style={activeCategory === cat ? { backgroundColor: storefrontBrandColor } : undefined}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-6">
                    <div className="px-4 pt-4 space-y-3">
                        {isLoading ? (
                            <p className="text-xs text-slate-400 text-center py-8">Loading menu...</p>
                        ) : filteredItems.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">No items in this category.</p>
                        ) : (
                            filteredItems.map((item) => <PublicMenuItemCard key={item.id} item={item} />)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
