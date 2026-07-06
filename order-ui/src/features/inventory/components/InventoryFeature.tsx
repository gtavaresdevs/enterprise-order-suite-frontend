import { useState } from "react";
import { Plus, Search, Package } from "lucide-react";
import { CATEGORIES } from "../constants/inventory.constants";
import { useInventory } from "../hooks/useInventory";
import { ProductCard } from "./ProductCard";
import { AddProductModal } from "./AddProductModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function InventoryFeature() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCat] = useState("All");
    const [addOpen, setAddOpen] = useState(false);

    const { products, isLoading, createProduct, isCreating, deleteProduct } = useInventory();

    // Local filtering (Derived State)
    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q);
        const matchCat = activeCategory === "All" || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    const availableCount = products.filter((p) => p.available).length;
    const modifiersCount = products.filter((p) => p.modifiers && p.modifiers.length > 0).length;

    return (
        <div className="min-h-full">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">Enterprise Order Suite</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 font-outfit">Menu & Catalog</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage your product listings, descriptions, and modifier configurations.
                        </p>
                    </div>
                    <Button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-2 rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all mt-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Product
                    </Button>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Total Products", value: products.length },
                        { label: "Available", value: availableCount },
                        { label: "With Modifiers", value: modifiersCount },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-[8px] border border-slate-100 px-4 py-3.5 flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide font-mono">{label}</p>
                            <p className="text-xl font-semibold text-slate-900 font-mono">
                                {isLoading ? "-" : value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sticky toolbar */}
                <div className="sticky top-4 z-30 mb-6">
                    <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-[8px] px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products by name, category, or description..."
                                className="h-9 pl-9 pr-4 rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10"
                            />
                        </div>
                        <div className="w-px h-5 bg-slate-200" />
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setActiveCat(c)}
                                    className={`flex-shrink-0 h-7 px-3 rounded-[8px] text-xs font-medium transition-all ${activeCategory === c
                                            ? "bg-slate-950 text-slate-50 border border-slate-800 shadow-inner"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product grid Orchestration */}
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <p className="text-sm text-slate-400 font-mono animate-pulse">Loading catalog...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <Package className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400">No products match your search.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-slate-400 font-mono mb-4">
                            {filtered.length} product{filtered.length !== 1 ? "s" : ""} shown
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {filtered.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={() => console.log("Edit product", product.id)}
                                    onDelete={(id) => deleteProduct(id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {addOpen && (
                <AddProductModal
                    onClose={() => setAddOpen(false)}
                    onSubmit={(data) => {
                        createProduct(data);
                        setAddOpen(false);
                    }}
                    isSubmitting={isCreating}
                />
            )}
        </div>
    );
}