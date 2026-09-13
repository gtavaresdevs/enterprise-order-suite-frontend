import api from "@/api/client";
import type { PagedResponse, AuditEvent } from "@/types/administration";

export const auditLogService = {
    // GET /api/admin/identity-audit?page&size
    listEvents: async (page: number, size: number): Promise<PagedResponse<AuditEvent>> => {
        const { data } = await api.get<PagedResponse<AuditEvent>>("/admin/identity-audit", {
            params: { page, size },
        });
        return data;
    },
};
