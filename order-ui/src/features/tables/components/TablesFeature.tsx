import { useState } from "react";
import { Plus, QrCode } from "lucide-react";
import { useTables } from "../hooks/useTables";
import { TableCard } from "./TableCard";
import { AddTableModal } from "./AddTableModal";
import { Button } from "@/components/ui/button";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function TablesFeature() {
    const [addOpen, setAddOpen] = useState(false);
    const { tables, isLoading, createTable, isCreating, deleteTable } = useTables();

    return (
        <div className="min-h-full">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8">

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <QrCode className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">Enterprise Order Suite</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900 font-outfit">Tables</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Print-and-place QR codes linking each table to the read-only menu view.
                        </p>
                    </div>
                    <Button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-2 rounded-[8px] h-9 bg-slate-950 text-slate-50 border-slate-800 shadow-inner hover:bg-slate-800 transition-all mt-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Table
                    </Button>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <p className="text-sm text-slate-400 font-mono animate-pulse">Loading tables...</p>
                    </div>
                ) : tables.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <QrCode className="w-8 h-8 text-slate-200" />
                        <p className="text-sm text-slate-400">No tables yet. Add one to generate its QR code.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {tables.map((table) => (
                            <TableCard key={table.id} table={table} onDelete={(id) => deleteTable(id)} />
                        ))}
                    </div>
                )}
            </div>

            {addOpen && (
                <AddTableModal
                    onClose={() => setAddOpen(false)}
                    onSubmit={(name) => {
                        createTable(name);
                        setAddOpen(false);
                    }}
                    isSubmitting={isCreating}
                />
            )}
        </div>
    );
}
