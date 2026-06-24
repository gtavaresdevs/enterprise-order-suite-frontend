import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface PreferencesSelectProps {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    icon?: React.ElementType;
}

export function PreferencesSelect({
    value,
    onChange,
    options,
    icon: Icon,
}: PreferencesSelectProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={`h-9 bg-slate-50 rounded-[8px] border-slate-200 text-slate-800 focus:ring-slate-950/10 focus:border-slate-400 ${Icon ? "pl-8" : "pl-3"}`}>
                <div className="relative flex items-center w-full">
                    {Icon && (
                        <Icon className="absolute -left-5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    )}
                    <SelectValue placeholder="Select option" />
                </div>
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}