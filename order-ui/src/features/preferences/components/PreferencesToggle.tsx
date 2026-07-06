import { Switch } from "@/components/ui/switch";

interface PreferencesToggleProps {
    checked: boolean;
    onChange: (v: boolean) => void;
}

export function PreferencesToggle({ checked, onChange }: PreferencesToggleProps) {
    return (
        <Switch
            checked={checked}
            onCheckedChange={onChange}
        />
    );
}