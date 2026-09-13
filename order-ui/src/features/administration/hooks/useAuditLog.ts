import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLog.service";
import { ADMINISTRATION_PAGE_SIZE } from "../constants/administration.constants";

export function useAuditLog(page: number) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["identity-audit", page, ADMINISTRATION_PAGE_SIZE],
        queryFn: () => auditLogService.listEvents(page, ADMINISTRATION_PAGE_SIZE),
        placeholderData: keepPreviousData,
    });

    return { data, isLoading, isError };
}
