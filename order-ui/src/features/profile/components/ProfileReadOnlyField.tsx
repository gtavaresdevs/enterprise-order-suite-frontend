interface ProfileReadOnlyFieldProps {
    label: string;
    value: string;
}

export function ProfileReadOnlyField({ label, value }: ProfileReadOnlyFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {label}
            </span>
            <p className="text-sm font-medium text-slate-900 py-1.5">
                {value}
            </p>
        </div>
    );
}
