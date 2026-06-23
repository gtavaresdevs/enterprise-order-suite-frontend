import { AlertTriangle } from "lucide-react";
import type { Order } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface DeleteModalProps {
    order: Order;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteOrderModal({ order, onConfirm, onCancel }: DeleteModalProps) {
    return (
        <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50" onClick={onCancel} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <CardHeader className="p-6 border-b flex flex-row items-start gap-3 bg-white">
                        <div className="w-9 h-9 rounded-[8px] bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5 mt-0.5">
                            <h3 className="text-sm font-semibold text-slate-900">Delete Order</h3>
                            <p className="text-xs text-slate-500">This action cannot be undone.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 bg-white">
                        <p className="text-sm text-slate-600">
                            Are you sure you want to permanently delete{" "}
                            <span className="font-mono font-medium text-slate-800">{order.id}</span> from{" "}
                            <span className="font-medium text-slate-800">{order.company}</span>?
                        </p>
                    </CardContent>
                    <CardFooter className="p-6 border-t bg-slate-50/50 flex justify-end gap-2">
                        <Button variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button variant="destructive" onClick={onConfirm}>Delete Order</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}