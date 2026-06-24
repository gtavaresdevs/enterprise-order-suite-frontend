import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, Lock, Shield, AlertTriangle } from "lucide-react";
import type { SecurityPreferences } from "@/types/settings";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SecurityPanelProps {
    prefs: SecurityPreferences;
    onUpdatePref: (key: keyof SecurityPreferences, value: boolean) => void;
}

export function SecurityPanel({ prefs, onUpdatePref }: SecurityPanelProps) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwSaved, setPwSaved] = useState(false);

    function handleSavePassword() {
        setPwSaved(true);
        setTimeout(() => setPwSaved(false), 2000);
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Password Change Card */}
            <Card className="border-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-5 py-3.5 space-y-0">
                    <p className="text-sm font-semibold text-slate-800">Change Password</p>
                    <p className="text-xs text-slate-400">Use a minimum of 12 characters with mixed case and symbols.</p>
                </CardHeader>
                <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Current Password</Label>
                        <div className="relative">
                            <Input
                                type={showCurrent ? "text" : "password"}
                                placeholder="••••••••••••"
                                className="pr-9 h-9 rounded-[8px] bg-slate-50 border-slate-200"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowCurrent((v) => !v)}
                                className="absolute right-0 top-0 h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                            >
                                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showNew ? "text" : "password"}
                                    placeholder="New password"
                                    className="pr-9 h-9 rounded-[8px] bg-slate-50 border-slate-200"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="absolute right-0 top-0 h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                                >
                                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Confirm New</Label>
                            <Input
                                type="password"
                                placeholder="Confirm"
                                className="h-9 rounded-[8px] bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/40 flex justify-end">
                    <Button
                        onClick={handleSavePassword}
                        className={`gap-2 h-9 px-5 rounded-[8px] text-sm font-semibold border shadow-inner transition-all ${pwSaved ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700" : "bg-slate-950 text-slate-50 border-slate-800 hover:bg-slate-800"
                            }`}
                    >
                        {pwSaved ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {pwSaved ? "Password Updated" : "Update Password"}
                    </Button>
                </CardFooter>
            </Card>

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