import api from "@/api/client";
import type { RoleOption } from "@/types/administration";

export const rolesService = {
    // GET /api/roles
    listRoles: async (): Promise<RoleOption[]> => {
        const { data } = await api.get<RoleOption[]>("/roles");
        return data;
    },
};
