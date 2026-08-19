import { useEffect, useState } from "react";
import { ADMINISTRATION_PAGES } from "@/features/administration/constants/administration.constants";
import { administrationService } from "@/features/administration/services/administration.service";
import type {
    AdministrationPageId,
    AdministrationPageStatus,
} from "@/types/administration";


export function useAdministrationPage(pageId: AdministrationPageId) {
    const page = ADMINISTRATION_PAGES[pageId];
    const [status, setStatus] = useState<AdministrationPageStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        administrationService.getPageStatus(pageId).then((data) => {
            if (!cancelled) {
                setStatus(data);
                setIsLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [pageId]);

    return { page, status, isLoading };
}
