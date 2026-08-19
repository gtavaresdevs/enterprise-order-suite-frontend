interface AdministrationHeaderProps {
    title: string;
    description: string;
}

export function AdministrationHeader({ title, description }: AdministrationHeaderProps) {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    );
}
