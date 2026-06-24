import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProfileFieldProps {
    label: string;
    icon?: React.ElementType;
    value?: string;
    onChange?: (val: string) => void;
    type?: string;
    placeholder?: string;
    isTextarea?: boolean;
    children?: React.ReactNode;
}

export function ProfileField({
    label,
    icon: Icon,
    value,
    onChange,
    type = "text",
    placeholder,
    isTextarea,
    children,
}: ProfileFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {label}
            </Label>

            {isTextarea ? (
                children
            ) : (
                <div className="relative flex items-center w-full">
                    {Icon && (
                        <Icon className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                    )}
                    <Input
                        type={type}
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder={placeholder}
                        className={`h-9 rounded-[8px] bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-slate-950/10 focus-visible:border-slate-400 transition-all shadow-none ${Icon ? "pl-8" : "pl-3"
                            }`}
                    />
                </div>
            )}
        </div>
    );
}