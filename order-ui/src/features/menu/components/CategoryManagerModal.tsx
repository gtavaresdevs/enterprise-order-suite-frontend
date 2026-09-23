import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Pencil, Trash2, Check, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryManagerModalProps {
    categories: string[];
    itemCountByCategory: Record<string, number>;
    onClose: () => void;
    createCategory: (name: string) => Promise<string>;
    renameCategory: (args: { oldName: string; newName: string }) => Promise<string>;
    deleteCategory: (name: string) => Promise<void>;
}

export function CategoryManagerModal({
    categories,
    itemCountByCategory,
    onClose,
    createCategory,
    renameCategory,
    deleteCategory,
}: CategoryManagerModalProps) {
    const { t } = useTranslation("menu");
    const [newName, setNewName] = useState("");
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const errorMessage = (err: unknown) => {
        const key = err instanceof Error ? err.message : "";
        if (key === "categoryNameRequired") return t("categoryManager.errors.nameRequired");
        if (key === "categoryNameTaken") return t("categoryManager.errors.nameTaken");
        if (key === "categoryInUse") return t("categoryManager.errors.inUse");
        return t("categoryManager.errors.generic");
    };

    const handleAdd = async () => {
        setError(null);
        setBusy(true);
        try {
            await createCategory(newName);
            setNewName("");
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const startEditing = (category: string) => {
        setError(null);
        setEditingCategory(category);
        setEditingValue(category);
    };

    const cancelEditing = () => {
        setEditingCategory(null);
        setEditingValue("");
    };

    const handleRename = async (oldName: string) => {
        if (editingValue.trim() === oldName) {
            cancelEditing();
            return;
        }
        setError(null);
        setBusy(true);
        try {
            await renameCategory({ oldName, newName: editingValue });
            cancelEditing();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (category: string) => {
        setError(null);
        setBusy(true);
        try {
            await deleteCategory(category);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const inputCls = "rounded-[8px] h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10";

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-md bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>

                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 font-outfit">{t("categoryManager.title")}</h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{t("categoryManager.subtitle")}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="px-6 py-5 space-y-3 max-h-[50vh] overflow-y-auto">
                        {categories.length === 0 && (
                            <p className="text-xs text-slate-400">{t("categoryManager.empty")}</p>
                        )}
                        {categories.map((category) => {
                            const count = itemCountByCategory[category] ?? 0;
                            const isEditing = editingCategory === category;
                            return (
                                <div key={category} className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 h-11">
                                    {isEditing ? (
                                        <>
                                            <Input
                                                autoFocus
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleRename(category)}
                                                className={`flex-1 h-8 ${inputCls}`}
                                            />
                                            <button
                                                onClick={() => handleRename(category)}
                                                disabled={busy}
                                                className="w-7 h-7 flex-shrink-0 rounded-[8px] flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="w-7 h-7 flex-shrink-0 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-sm text-slate-800 truncate">{category}</span>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {t("categoryManager.itemCount", { count })}
                                            </span>
                                            <button
                                                onClick={() => startEditing(category)}
                                                className="w-7 h-7 flex-shrink-0 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="relative group/delete flex-shrink-0">
                                                <button
                                                    onClick={() => handleDelete(category)}
                                                    disabled={busy || count > 0}
                                                    className="w-7 h-7 rounded-[8px] flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                {count > 0 && (
                                                    <div className="pointer-events-none absolute top-full right-0 mt-2 w-48 opacity-0 group-hover/delete:opacity-100 transition-opacity z-10">
                                                        <div className="rounded-[8px] bg-slate-900 text-white text-[11px] leading-snug px-2.5 py-1.5 shadow-lg">
                                                            {t("categoryManager.deleteBlockedTooltip", { count })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-[8px] space-y-2">
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder={t("categoryManager.newCategoryPlaceholder")}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                className={`flex-1 ${inputCls}`}
                            />
                            <Button
                                onClick={handleAdd}
                                disabled={busy || !newName.trim()}
                                className="rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
