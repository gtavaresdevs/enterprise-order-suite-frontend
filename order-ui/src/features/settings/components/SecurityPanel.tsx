import { Shield, AlertTriangle } from "lucide-react";
import type { SecurityPreferences } from "@/types/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SecurityPanelProps {
    prefs: SecurityPreferences;
    onUpdatePref: (key: keyof SecurityPreferences, value: boolean) => void;
}

export function SecurityPanel({ prefs, onUpdatePref }: SecurityPanelProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* 2FA & Login Alerts */}
            <Card className="border-slate-100 overflow-hidden">
                <CardContent className="p-0 flex flex-col">
                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-[8px] bg-slate-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <Shield className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-medium text-slate-800">Two-Factor Authentication</p>
                                <p className="text-xs text-slate-400">Require a verification code in addition to your password.</p>
                                {prefs.twoFA && (
                                    <Badge variant="outline" className="w-max mt-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border-emerald-100 px-2 py-0.5 rounded-[8px] gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Enabled via Authenticator App
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Switch checked={prefs.twoFA} onCheckedChange={(v) => onUpdatePref("twoFA", v)} />
                    </div>

                    <Separator className="bg-slate-50" />

                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-[8px] bg-slate-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <AlertTriangle className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-medium text-slate-800">Login Anomaly Alerts</p>
                                <p className="text-xs text-slate-400">Email alerts when login from an unrecognized IP or device is detected.</p>
                            </div>
                        </div>
                        <Switch checked={prefs.loginAlerts} onCheckedChange={(v) => onUpdatePref("loginAlerts", v)} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}