import { MonitorSmartphone, LogOut } from "lucide-react";
import type { ActiveSession } from "@/types/settings";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SessionsPanelProps {
    sessions: ActiveSession[];
    onRevoke: (id: string) => void;
    onRevokeAll: () => void;
}

export function SessionsPanel({ sessions, onRevoke, onRevokeAll }: SessionsPanelProps) {
    return (
        <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-5 py-3.5 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-800">Active Sessions</p>
                    <p className="text-xs text-slate-400">{sessions.length} session{sessions.length !== 1 ? "s" : ""} currently authenticated.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={onRevokeAll}
                    className="gap-1.5 h-8 px-3 rounded-[8px] border-red-200 bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                    <LogOut className="w-3 h-3" /> Revoke others
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex flex-col">
                {sessions.map((s, index) => (
                    <div key={s.id} className="flex flex-col">
                        {index > 0 && <Separator className="bg-slate-50" />}
                        <div className="px-5 py-4 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-[8px] bg-slate-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                    <MonitorSmartphone className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="min-w-0 flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-slate-800">{s.device}</p>
                                        {s.current && (
                                            <Badge variant="outline" className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border-emerald-100 px-1.5 py-0.5 rounded-[8px] gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Current
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="font-mono text-[11px] text-slate-400">{s.ip} · {s.location}</p>
                                    <p className="text-[11px] text-slate-400">{s.time}</p>
                                </div>
                            </div>
                            {!s.current && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onRevoke(s.id)}
                                    className="flex-shrink-0 w-8 h-8 rounded-[8px] text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
                                    title="Revoke session"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}