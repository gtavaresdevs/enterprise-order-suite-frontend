// Implemented as a feature component since it's a specific visual primitive 
// that sits outside the standard ShadCN Tabs ARIA-tablist structure.
interface SegmentedOption<T> {
    value: T;
    label: string;
    icon?: React.ElementType;
}

interface PreferencesSegmentedControlProps<T extends string> {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (v: T) => void;
}

export function PreferencesSegmentedControl<T extends string>({
    options,
    value,
    onChange,
}: PreferencesSegmentedControlProps<T>) {
    return (
        <div className="inline-flex bg-slate-100 rounded-[8px] p-0.5 gap-0.5">
            {options.map((opt) => {
                const Icon = opt.icon;
                const active = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[8px] text-sm font-medium transition-all ${active
                                ? "bg-slate-950 text-slate-50 shadow-inner border border-slate-800"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/60"
                            }`}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}