import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Store, Camera, ImagePlus, ExternalLink } from "lucide-react";

export function StorefrontSection() {
    const navigate = useNavigate();
    const logoRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const [logoSrc, _setLogoSrc] = useState<string | null>(null);
    const [coverSrc, _setCoverSrc] = useState<string | null>(null);
    const [brandColor, setBrandColor] = useState("#0f172a");

    const inputCls = "w-full h-9 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition-all";

    return (
        <div className="bg-white rounded-[8px] border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-slate-950 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-slate-100" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Storefront & White-label</p>
                        <p className="text-xs text-slate-400 mt-0.5">Configure your public customer-facing store identity.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/storefront")}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <ExternalLink className="w-3 h-3" /> Preview Store
                </button>
            </div>

            <div className="px-5 py-5 space-y-5">
                <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Store Logo</label>
                        <div className="relative group cursor-pointer" onClick={() => logoRef.current?.click()}>
                            <div className="w-20 h-20 rounded-[8px] border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center hover:border-slate-400 transition-colors">
                                {logoSrc ? (
                                    <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1"><Camera className="w-5 h-5 text-slate-300" /><span className="text-[10px] text-slate-400">Upload</span></div>
                                )}
                            </div>
                            <input ref={logoRef} type="file" accept="image/*" className="hidden" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 w-20 text-center">PNG · 1:1</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Cover Banner</label>
                        <div
                            className="w-full h-20 rounded-[8px] border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-colors"
                            onClick={() => coverRef.current?.click()}
                        >
                            {coverSrc ? (
                                <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-1.5"><ImagePlus className="w-5 h-5 text-slate-300" /><span className="text-xs text-slate-400">Click to upload cover image</span></div>
                            )}
                        </div>
                        <input ref={coverRef} type="file" accept="image/*" className="hidden" />
                        <p className="text-[10px] text-slate-400 mt-1">JPG or PNG · min 800×200px</p>
                    </div>
                </div>

                <div className="border-t border-slate-50" />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Brand Primary Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="w-10 h-9 rounded-[8px] border border-slate-200 cursor-pointer p-0.5 bg-slate-50 flex-shrink-0"
                        />
                        <input
                            type="text"
                            value={brandColor}
                            className={`${inputCls} font-mono uppercase`}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}