import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Store, Camera, ImagePlus, ExternalLink, Phone, Copy, Check } from "lucide-react";
import { usePreferencesContext } from "@/app/providers/PreferencesProvider";

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function StorefrontSection() {
    const { t } = useTranslation("preferences");
    const navigate = useNavigate();
    const logoRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const { preferences, updatePreference } = usePreferencesContext();
    const { storefrontLogo: logoSrc, storefrontCover: coverSrc, storefrontBrandColor: brandColor } = preferences;
    const [linkCopied, setLinkCopied] = useState(false);
    const orderingLink = `${window.location.origin}/storefront`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(orderingLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            // Clipboard permission denied by the browser — nothing to recover here.
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            updatePreference("storefrontLogo", await readFileAsDataUrl(file));
        } catch (err) {
            console.error("Failed to read logo file", err);
        }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            updatePreference("storefrontCover", await readFileAsDataUrl(file));
        } catch (err) {
            console.error("Failed to read cover file", err);
        }
    };

    const inputCls = "w-full h-9 px-3 rounded-[8px] border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition-all";

    return (
        <div className="bg-white rounded-[8px] border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-slate-950 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-slate-100" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{t("storefrontSection.title")}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t("storefrontSection.description")}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/storefront")}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <ExternalLink className="w-3 h-3" /> {t("storefrontSection.previewStore")}
                </button>
            </div>

            <div className="px-5 py-5 space-y-5">
                <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("storefrontSection.storeLogo")}</label>
                        <div className="relative group cursor-pointer" onClick={() => logoRef.current?.click()}>
                            <div className="w-20 h-20 rounded-[8px] border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center hover:border-slate-400 transition-colors">
                                {logoSrc ? (
                                    <img src={logoSrc} alt={t("storefrontSection.logoAlt")} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1"><Camera className="w-5 h-5 text-slate-300" /><span className="text-[10px] text-slate-400">{t("storefrontSection.upload")}</span></div>
                                )}
                            </div>
                            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 w-20 text-center">{t("storefrontSection.logoHint")}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("storefrontSection.coverBanner")}</label>
                        <div
                            className="w-full h-20 rounded-[8px] border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-colors"
                            onClick={() => coverRef.current?.click()}
                        >
                            {coverSrc ? (
                                <img src={coverSrc} alt={t("storefrontSection.coverAlt")} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-1.5"><ImagePlus className="w-5 h-5 text-slate-300" /><span className="text-xs text-slate-400">{t("storefrontSection.coverUploadHint")}</span></div>
                            )}
                        </div>
                        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                        <p className="text-[10px] text-slate-400 mt-1">{t("storefrontSection.coverHint")}</p>
                    </div>
                </div>

                <div className="border-t border-slate-50" />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("storefrontSection.brandPrimaryColor")}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={brandColor}
                            onChange={(e) => updatePreference("storefrontBrandColor", e.target.value)}
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

                <div className="border-t border-slate-50" />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("storefrontSection.whatsappLabel")}</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={preferences.whatsappNumber}
                            onChange={(e) => updatePreference("whatsappNumber", e.target.value.replace(/[^\d]/g, ""))}
                            placeholder={t("storefrontSection.whatsappPlaceholder")}
                            className={`${inputCls} pl-8 font-mono`}
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{t("storefrontSection.whatsappHint")}</p>
                </div>

                <div className="border-t border-slate-50" />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{t("storefrontSection.orderingLinkLabel")}</label>
                    <div className="flex items-center gap-2">
                        <input type="text" readOnly value={orderingLink} className={`${inputCls} font-mono text-xs`} />
                        <button
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                        >
                            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {linkCopied ? t("storefrontSection.linkCopied") : t("storefrontSection.copyLink")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}