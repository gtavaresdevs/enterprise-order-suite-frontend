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

                    <PreferenceSectionCard icon={Monitor} title="Interface" description="Visual theme and display density options.">
                        <PreferenceRow label="Color Theme" sub="Controls the global visual mode of the dashboard.">
                            <PreferencesSegmentedControl
                                value={preferences.theme}
                                onChange={(v) => updatePreference("theme", v)}
                                options={[
                                    { value: "light", label: "Light", icon: Sun },
                                    { value: "dark", label: "Dark", icon: Moon },
                                    { value: "system", label: "System", icon: Monitor },
                                ]}
                            />
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label="Font Size" sub="Base text size for all UI elements.">
                            <div className="w-52">
                                <PreferencesSelect value={preferences.fontSize} onChange={(v) => updatePreference("fontSize", v)} options={FONT_SIZES} icon={Type} />
                            </div>
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label="Compact Mode" sub="Reduce padding and spacing for higher information density.">
                            <PreferencesToggle checked={preferences.compactMode} onChange={(v) => updatePreference("compactMode", v)} />
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label="Dense Table Rows" sub="Show more order rows per screen in the data table.">
                            <PreferencesToggle checked={preferences.denseTable} onChange={(v) => updatePreference("denseTable", v)} />
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label="Reduce Motion" sub="Disable non-essential transitions and animations.">
                            <PreferencesToggle checked={preferences.reducedMotion} onChange={(v) => updatePreference("reducedMotion", v)} />
                        </PreferenceRow>
                    </PreferenceSectionCard>

                    <PreferenceSectionCard icon={Globe} title="Regional" description="Time zone, language, and localization preferences.">
                        <PreferenceRow label="Language" sub="Interface text and content language.">
                            <div className="w-56">
                                <PreferencesSelect value={preferences.language} onChange={(v) => updatePreference("language", v)} options={LANGUAGES} icon={Globe} />
                            </div>
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label="Time Zone" sub="Used for order timestamps and scheduling displays.">
                            <div className="w-72">
                                <PreferencesSelect value={preferences.timezone} onChange={(v) => updatePreference("timezone", v)} options={TIMEZONES} />
                            </div>
                        </PreferenceRow>
                    </PreferenceSectionCard>

                    <PreferenceSectionCard icon={Rows3} title="Data Formatting" description="Date, currency, and numerical display conventions.">
                        <PreferenceRow label="Date Format" sub="How dates are displayed across order and transaction records.">
                            <div className="w-44">
                                <PreferencesSelect value={preferences.dateFormat} onChange={(v) => updatePreference("dateFormat", v)} options={DATE_FORMATS} icon={Calendar} />
                            </div>
                        </PreferenceRow>
                        <Separator />
                        <PreferenceRow label="Currency" sub="Default currency for pricing, invoices, and totals.">
                            <div className="w-52">
                                <PreferencesSelect value={preferences.currency} onChange={(v) => updatePreference("currency", v)} options={CURRENCIES} icon={DollarSign} />
                            </div>
                        </PreferenceRow>
                    </PreferenceSectionCard>

                    <PreferenceSectionCard icon={Layout} title="Layout" description="Configure dashboard panel and sidebar behavior.">
                        <PreferenceRow label="Sidebar Navigation" sub="Pin the sidebar or collapse to icon-only mode.">
                            <PreferencesSegmentedControl
                                value={preferences.sidebarNavigation}
                                onChange={(v) => updatePreference("sidebarNavigation", v)}
                                options={[
                                    { value: "expanded", label: "Expanded" },
                                    { value: "collapsed", label: "Icons only" },
                                    { value: "auto", label: "Auto" },
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