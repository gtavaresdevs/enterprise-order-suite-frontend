import { useState } from "react";
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
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit(name.trim());
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-sm bg-white rounded-[8px] border border-slate-200 shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 font-outfit">Add Table</h2>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">Generates a QR code linking to the read-only menu view.</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="px-6 py-5">
                        <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 font-mono">Table Name</Label>
                        <div className="relative">
                            <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="e.g. Table 6, Patio 3"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-8 rounded-[8px] h-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-950/10"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2 rounded-b-[8px]">
                        <Button variant="outline" onClick={onClose} className="rounded-[8px] h-9 border-slate-200 text-slate-600 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !name.trim()}
                            className="rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all"
                        >
                            {isSubmitting ? "Adding..." : "Add Table"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
