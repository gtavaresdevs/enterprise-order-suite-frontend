import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLog.service";

export const AUDIT_PAGE_SIZE = 20;

export function useAuditLog(page: number) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["identity-audit", page, AUDIT_PAGE_SIZE],
        queryFn: () => auditLogService.listEvents(page, AUDIT_PAGE_SIZE),
    });

    return { data, isLoading, isError };
}
