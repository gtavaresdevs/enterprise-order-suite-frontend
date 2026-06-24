import { useState } from "react";
import { Plus, CheckCircle2, Copy, X, Key, AlertTriangle } from "lucide-react";
import type { ApiKey } from "@/types/settings";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ApiPanelProps {
    keys: ApiKey[];
    onRevoke: (id: string) => void;
}

export function ApiPanel({ keys, onRevoke }: ApiPanelProps) {
    const [copied, setCopied] = useState<string | null>(null);

    function handleCopy(id: string) {
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="border-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-5 py-3.5 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-800">API Keys</p>
                        <p className="text-xs text-slate-400">Keys grant programmatic access to the Enterprise Order Suite API.</p>
                    </div>
                    <Button className="gap-1.5 h-8 px-3 rounded-[8px] bg-slate-950 text-slate-50 text-xs font-semibold border border-slate-800 shadow-inner hover:bg-slate-800">
                        <Plus className="w-3 h-3" /> New Key
                    </Button>
                </CardHeader>

                <CardContent className="p-0 flex flex-col">
                    {keys.map((k, index) => (
                        <div key={k.id} className="flex flex-col">
                            {index > 0 && <Separator className="bg-slate-50" />}
                            <div className="px-5 py-4 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium text-slate-800">{k.label}</p>
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${k.scope === "read/write" ? "text-violet-700 bg-violet-50 border-violet-100" : "text-slate-500 bg-slate-50 border-slate-100"}`}>
                                            {k.scope}
                                        </Badge>
                                    </div>
                                    <p className="font-mono text-xs text-slate-400">{k.prefix}••••••••••</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Created {k.created} · Last used {k.last}</p>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleCopy(k.id)}
                                        className="w-8 h-8 rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        title="Copy key prefix"
                                    >
                                        {copied === k.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => onRevoke(k.id)}
                                        className="w-8 h-8 rounded-[8px] text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
                                        title="Revoke key"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {keys.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center">
                            <Key className="w-6 h-6 text-slate-200 mb-2" />
                            <p className="text-sm text-slate-400">No active API keys. Create one to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                    API keys grant full account access. Never share them publicly or commit them to source control. Rotate keys regularly for production workloads.
                </p>
            </div>
        </div>
    );
}