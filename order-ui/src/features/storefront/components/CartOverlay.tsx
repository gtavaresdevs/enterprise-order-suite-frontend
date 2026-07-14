import { X } from "lucide-react";
import type { CartItem } from "@/types/storefront";

interface CartOverlayProps {
    cart: CartItem[];
    total: number;
    onClose: () => void;
    onCheckout: () => void;
}

export const CartOverlay = ({ cart, total, onClose, onCheckout }: CartOverlayProps) => {
    return (
        <>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-[8px] flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.12)] max-h-[70%]">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900">Your Cart</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {cart.length > 0 ? cart.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-900 truncate">{item.quantity}x {item.name}</h3>
                                <p className="text-sm font-mono font-medium text-slate-900 mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    )) : <p className="text-center text-slate-500 text-sm">Your cart is empty.</p>}
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-500 font-medium">Subtotal</span>
                        <span className="text-sm font-mono font-medium text-slate-900">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Delivery Fee</span>
                        <span className="text-sm font-mono font-medium text-slate-900">$3.50</span>
                    </div>
                </div>

                <div className="p-5 pt-3 bg-white">
                    <button disabled={cart.length === 0} onClick={onCheckout} className="w-full h-[52px] bg-slate-950 text-slate-50 rounded-[8px] flex items-center justify-center gap-2 font-semibold text-[15px] hover:bg-slate-900 disabled:opacity-50 transition-all">
                        Go to Checkout • <span className="font-mono">${(total + 3.50).toFixed(2)}</span>
                    </button>
                </div>
            </div>
        </>
    );
};