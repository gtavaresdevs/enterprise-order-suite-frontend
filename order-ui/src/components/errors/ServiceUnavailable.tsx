import { ServerCrash, RotateCw, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";

// Full-screen fallback when the backend can't be reached (network error / 5xx) for data the
// shell can't run without, e.g. the signed-in user's profile. Never shown for a 401 — that
// path refreshes the session or sends the user to /login instead.
export function ServiceUnavailable({ onRetry }: { onRetry: () => void }) {
    const { t } = useTranslation("shell");
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    return (
        <div
            className="flex h-screen w-full items-center justify-center bg-background px-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            role="alert"
        >
            <div className="w-full max-w-md rounded-[12px] border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                    <ServerCrash className="h-6 w-6 text-red-500" />
                </div>
                <h1 className="text-lg font-semibold text-slate-900">{t("serviceUnavailable.title")}</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{t("serviceUnavailable.description")}</p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <Button variant="outline" onClick={() => logout()} disabled={isLoggingOut}>
                        <LogOut className="h-4 w-4" />
                        {t("account.signOut")}
                    </Button>
                    <Button onClick={onRetry}>
                        <RotateCw className="h-4 w-4" />
                        {t("serviceUnavailable.retry")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
