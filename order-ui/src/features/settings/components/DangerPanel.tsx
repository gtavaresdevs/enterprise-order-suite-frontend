import { useState } from "react";
import { Download, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DangerPanel() {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

    return (
        <div className="flex flex-col gap-4">
            {/* Export Data */}
            <Card className="border-slate-100 overflow-hidden">
                <CardContent className="px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[8px] bg-slate-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <Download className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-slate-800">Export Account Data</p>
                            <p className="text-xs text-slate-400">Download a full archive of your orders, activity logs, and profile data in JSON/CSV format.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="flex-shrink-0 h-8 px-4 rounded-[8px] text-xs font-medium text-slate-600 hover:bg-slate-50">
                        Request Export
                    </Button>
                </CardContent>
            </Card>

            {/* Reset 2FA */}
            <Card className="border-slate-100 overflow-hidden">
                <CardContent className="px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[8px] bg-amber-50 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <RefreshCw className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-slate-800">Reset Two-Factor Authentication</p>
                            <p className="text-xs text-slate-400">Removes your current 2FA configuration. You will be prompted to re-enroll on next login.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="flex-shrink-0 h-8 px-4 rounded-[8px] border-amber-200 bg-amber-50 text-xs font-medium text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                        Reset 2FA
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-red-200 overflow-hidden">
                <CardHeader className="bg-red-50/60 border-b border-red-100 px-5 py-3.5 space-y-0">
                    <p className="text-sm font-semibold text-red-700">Delete Account</p>
                    <p className="text-xs text-red-500">Permanently removes all data, orders, API keys, and sessions. This cannot be undone.</p>
                </CardHeader>
                <CardContent className="px-5 py-4">
                    {!confirmDelete ? (
                        <Button
                            onClick={() => setConfirmDelete(true)}
                            className="gap-2 h-9 px-5 rounded-[8px] bg-red-600 text-white text-sm font-semibold border border-red-700/50 shadow-inner hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" /> Delete my account
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-[8px]">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-red-700">
                                    This will permanently delete your account and all associated data. Type{" "}
                                    <span className="font-mono font-bold">{CONFIRM_PHRASE}</span> to confirm.
                                </p>
                            </div>
                            <Input
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder={CONFIRM_PHRASE}
                                className="h-9 rounded-[8px] border-red-200 bg-red-50/40 font-mono text-sm text-red-800 placeholder-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-400"
                            />
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => { setConfirmDelete(false); setDeleteInput(""); }}
                                    className="h-9 px-4 rounded-[8px] text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={deleteInput !== CONFIRM_PHRASE}
                                    className="h-9 px-5 rounded-[8px] bg-red-600 text-white text-sm font-semibold border border-red-700/50 shadow-inner hover:bg-red-700 disabled:opacity-40"
                                >
                                    Confirm Deletion
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}