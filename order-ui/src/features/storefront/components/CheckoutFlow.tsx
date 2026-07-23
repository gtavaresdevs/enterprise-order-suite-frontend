import { ArrowLeft, MapPin, CreditCard } from "lucide-react";

export const CheckoutFlow = ({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) => {
    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col">
            <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 flex-shrink-0">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-slate-900 -ml-1">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-[17px] font-semibold text-slate-900 ml-2">Checkout</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <section>
                    <h2 className="text-sm font-bold text-slate-900 mb-2 px-1">Delivery Address</h2>
                    <div className="bg-white rounded-[8px] border border-slate-100 p-4 shadow-sm relative">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-slate-400"><MapPin className="w-5 h-5" /></div>
                            <div>
                                <p className="font-semibold text-slate-900">Marcus T.</p>
                                <p className="text-slate-600 text-sm mt-0.5">123 Main St, Apt 4B</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-bold text-slate-900 mb-2 px-1">Payment Method</h2>
                    <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <label className="flex items-center gap-3 p-4 border-b border-slate-100 cursor-pointer">
                            <div className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /></div>
                            <CreditCard className="w-5 h-5 text-slate-400" />
                            <span className="flex-1 text-sm font-semibold text-slate-900">Card ending in •••• 4242</span>
                        </label>
                    </div>
                </section>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 pb-8">
                <button onClick={onComplete} className="w-full h-[52px] bg-slate-950 text-slate-50 rounded-[8px] font-semibold text-[15px] hover:bg-slate-900">
                    Place Order
                </button>
            </div>
        </div>
    );
};