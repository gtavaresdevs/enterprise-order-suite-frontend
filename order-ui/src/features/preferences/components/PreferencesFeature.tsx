import { useTranslation } from "react-i18next";
import {
    Monitor, Sun, Moon, Globe, Calendar,
    DollarSign, Layout, Type, Rows3
} from "lucide-react";
import { usePreferences } from "@/features/preferences/hooks/usePreferences";
import { PreferencesHeader } from "@/features/preferences/components/PreferencesHeader";
import { PreferenceSectionCard } from "@/features/preferences/components/PreferencesSectionCard";
import { PreferenceRow } from "@/features/preferences/components/PreferencesRow";
import { PreferencesSegmentedControl } from "@/features/preferences/components/PreferencesSegmentedControl";
import { PreferencesSelect } from "@/features/preferences/components/PreferencesSelect";
import { PreferencesToggle } from "@/features/preferences/components/PreferencesToggle";
import { PreferencesFooter } from "@/features/preferences/components/PreferencesFooter";
import { StorefrontSection } from "@/features/preferences/components/StorefrontSection";
import { DeliveryZonesSection } from "@/features/preferences/components/DeliveryZonesSection";
import { Separator } from "@/components/ui/separator";
import {
    TIMEZONES, LANGUAGES, DATE_FORMATS, CURRENCIES, FONT_SIZES,
} from "@/features/preferences/constants/preferences.constants";

const DOT_BG = {
    backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    opacity: 0.03,
} as const;

export function PreferencesFeature() {
    const { t } = useTranslation("preferences");
    const { preferences, isSaved, updatePreference, savePreferences } = usePreferences();

    return (
        <div className="min-h-full font-['Outfit',sans-serif]">
            <div className="fixed inset-0 pointer-events-none z-0" style={DOT_BG} />
            <div className="relative z-10 max-w-[800px] mx-auto px-6 py-8">
                <div className="mb-8">
                    <PreferencesHeader />
                </div>

                <div className="space-y-4">
                    <StorefrontSection />
                    <DeliveryZonesSection />

                    <PreferenceSectionCard icon={Monitor} title={t("sections.interface.title")} description={t("sections.interface.description")}>
                        <PreferenceRow label={t("rows.colorTheme.label")} sub={t("rows.colorTheme.sub")}>
                            <PreferencesSegmentedControl
                                value={preferences.theme}
                                onChange={(v) => updatePreference("theme", v)}
                                options={[
                                    { value: "light", label: t("themeOptions.light"), icon: Sun },
                                    { value: "dark", label: t("themeOptions.dark"), icon: Moon },
                                    { value: "system", label: t("themeOptions.system"), icon: Monitor },
                                ]}
                            />
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label={t("rows.fontSize.label")} sub={t("rows.fontSize.sub")}>
                            <div className="w-52">
                                <PreferencesSelect value={preferences.fontSize} onChange={(v) => updatePreference("fontSize", v)} options={FONT_SIZES} icon={Type} />
                            </div>
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label={t("rows.compactMode.label")} sub={t("rows.compactMode.sub")}>
                            <PreferencesToggle checked={preferences.compactMode} onChange={(v) => updatePreference("compactMode", v)} />
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label={t("rows.denseTableRows.label")} sub={t("rows.denseTableRows.sub")}>
                            <PreferencesToggle checked={preferences.denseTable} onChange={(v) => updatePreference("denseTable", v)} />
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label={t("rows.reduceMotion.label")} sub={t("rows.reduceMotion.sub")}>
                            <PreferencesToggle checked={preferences.reducedMotion} onChange={(v) => updatePreference("reducedMotion", v)} />
                        </PreferenceRow>
                    </PreferenceSectionCard>

                    <PreferenceSectionCard icon={Globe} title={t("sections.regional.title")} description={t("sections.regional.description")}>
                        <PreferenceRow label={t("rows.language.label")} sub={t("rows.language.sub")}>
                            <div className="w-56">
                                <PreferencesSelect value={preferences.language} onChange={(v) => updatePreference("language", v)} options={LANGUAGES} icon={Globe} />
                            </div>
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label={t("rows.timeZone.label")} sub={t("rows.timeZone.sub")}>
                            <div className="w-72">
                                <PreferencesSelect value={preferences.timezone} onChange={(v) => updatePreference("timezone", v)} options={TIMEZONES} />
                            </div>
                        </PreferenceRow>
                    </PreferenceSectionCard>

                    <PreferenceSectionCard icon={Rows3} title={t("sections.dataFormatting.title")} description={t("sections.dataFormatting.description")}>
                        <PreferenceRow label={t("rows.dateFormat.label")} sub={t("rows.dateFormat.sub")}>
                            <div className="w-44">
                                <PreferencesSelect value={preferences.dateFormat} onChange={(v) => updatePreference("dateFormat", v)} options={DATE_FORMATS} icon={Calendar} />
                            </div>
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label={t("rows.currency.label")} sub={t("rows.currency.sub")}>
                            <div className="w-52">
                                <PreferencesSelect value={preferences.currency} onChange={(v) => updatePreference("currency", v)} options={CURRENCIES} icon={DollarSign} />
                            </div>
                        </PreferenceRow>
                    </PreferenceSectionCard>

                    <PreferenceSectionCard icon={Layout} title={t("sections.layout.title")} description={t("sections.layout.description")}>
                        <PreferenceRow label={t("rows.sidebarNavigation.label")} sub={t("rows.sidebarNavigation.sub")}>
                            <PreferencesSegmentedControl
                                value={preferences.sidebarNavigation}
                                onChange={(v) => updatePreference("sidebarNavigation", v)}
                                options={[
                                    { value: "expanded", label: t("sidebarOptions.expanded") },
                                    { value: "collapsed", label: t("sidebarOptions.collapsed") },
                                    { value: "auto", label: t("sidebarOptions.auto") },
                                ]}
                            />
                        </PreferenceRow>
                    </PreferenceSectionCard>
                </div>

                <PreferencesFooter isSaved={isSaved} onSave={savePreferences} />
            </div>
        </div>
    );
}