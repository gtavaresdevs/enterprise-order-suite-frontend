import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Tags, UtensilsCrossed } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "../constants/menu.constants";
import { useMenu } from "../hooks/useMenu";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItemModal } from "./MenuItemModal";
import { CategoryManagerModal } from "./CategoryManagerModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/types/menu";

const ALL_CATEGORY = "All";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function MenuFeature() {
    const { t } = useTranslation("menu");
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCat] = useState(ALL_CATEGORY);
    const [addOpen, setAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

    const {
        menuItems, isLoading, createMenuItem, isCreating, updateMenuItem, isUpdating, deleteMenuItem,
        categories, createCategory, renameCategory, deleteCategory,
    } = useMenu();

    const filtered = menuItems.filter((item) => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q);
        const matchCat = activeCategory === ALL_CATEGORY || item.category === activeCategory;
        return matchSearch && matchCat;
    });

    const itemCountByCategory = menuItems.reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + 1;
        return acc;
    }, {});

    const availableCount = menuItems.filter((item) => item.available).length;
    const lowStockCount = menuItems.filter((item) => item.available && item.stockQuantity > 0 && item.stockQuantity <= LOW_STOCK_THRESHOLD).length;

    return (
        <div className="min-h-full">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8">

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">{t("feature.brandLabel")}</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 font-outfit">{t("feature.title")}</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {t("feature.subtitle")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Button
                            variant="outline"
                            onClick={() => setManageCategoriesOpen(true)}
                            className="inline-flex items-center gap-2 rounded-[8px] h-9 border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                            <Tags className="w-3.5 h-3.5" /> {t("feature.manageCategoriesButton")}
                        </Button>
                        <Button
                            onClick={() => setAddOpen(true)}
                            className="inline-flex items-center gap-2 rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" /> {t("feature.addItemButton")}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: t("feature.stats.totalItems"), value: menuItems.length },
                        { label: t("feature.stats.available"), value: availableCount },
                        { label: t("feature.stats.lowStock"), value: lowStockCount },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-[8px] border border-slate-100 px-4 py-3.5 flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide font-mono">{label}</p>
                            <p className="text-xl font-semibold text-slate-900 font-mono">
                                {isLoading ? "-" : value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="sticky top-4 z-30 mb-6">
                    <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-[8px] px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("feature.searchPlaceholder")}
                                className="h-9 pl-9 pr-4 rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10"
                            />
                        </div>
                        <div className="w-px h-5 bg-slate-200" />
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            {[ALL_CATEGORY, ...categories].map((c) => (
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

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <p className="text-sm text-slate-400 font-mono animate-pulse">{t("feature.loading")}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <UtensilsCrossed className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400">{t("feature.emptyText")}</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-slate-400 font-mono mb-4">
                            {t("feature.itemsShown", { count: filtered.length })}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {filtered.map((item) => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    onEdit={(item) => setEditingItem(item)}
                                    onDelete={(id) => deleteMenuItem(id)}
                                    onToggleAvailable={(item) => updateMenuItem({ ...item, available: !item.available })}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {addOpen && (
                <MenuItemModal
                    categories={categories}
                    onClose={() => setAddOpen(false)}
                    onSubmit={(data) => {
                        createMenuItem(data);
                        setAddOpen(false);
                    }}
                    isSubmitting={isCreating}
                />
            )}

            {manageCategoriesOpen && (
                <CategoryManagerModal
                    categories={categories}
                    itemCountByCategory={itemCountByCategory}
                    onClose={() => setManageCategoriesOpen(false)}
                    createCategory={createCategory}
                    renameCategory={renameCategory}
                    deleteCategory={deleteCategory}
                />
            )}

            {editingItem && (
                <MenuItemModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => setEditingItem(null)}
                    onSubmit={(data) => {
                        updateMenuItem({ ...data, id: editingItem.id });
                        setEditingItem(null);
                    }}
                    isSubmitting={isUpdating}
                />
            )}
        </div>
    );
}
