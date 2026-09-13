import api from "@/api/client";
import type {
    PagedResponse,
    UserSummary,
    UserDetail,
    CreateUserRequest,
    UpdateUserRequest,
    SetUserRoleRequest,
    UserStatusResponse,
} from "@/types/administration";

export const teamService = {
    // GET /api/users?page&size
    listUsers: async (page: number, size: number): Promise<PagedResponse<UserSummary>> => {
        const { data } = await api.get<PagedResponse<UserSummary>>("/users", {
            params: { page, size },
        });
        return data;
    },

    // GET /api/users/{id}
    getUser: async (id: number): Promise<UserDetail> => {
        const { data } = await api.get<UserDetail>(`/users/${id}`);
        return data;
    },

    // POST /api/admin/users
    inviteUser: async (request: CreateUserRequest): Promise<void> => {
        await api.post("/admin/users", request);
    },

    // PATCH /api/admin/users/{id}
    updateUser: async (id: number, request: UpdateUserRequest): Promise<void> => {
        await api.patch(`/admin/users/${id}`, request);
    },

    // PATCH /api/admin/users/{id}/role
    setUserRole: async (id: number, request: SetUserRoleRequest): Promise<UserStatusResponse> => {
        const { data } = await api.patch<UserStatusResponse>(`/admin/users/${id}/role`, request);
        return data;
    },

    // POST /api/admin/users/{id}/deactivate
    deactivateUser: async (id: number): Promise<UserStatusResponse> => {
        const { data } = await api.post<UserStatusResponse>(`/admin/users/${id}/deactivate`);
        return data;
    },

    // POST /api/admin/users/{id}/reactivate
    reactivateUser: async (id: number): Promise<UserStatusResponse> => {
        const { data } = await api.post<UserStatusResponse>(`/admin/users/${id}/reactivate`);
        return data;
    },

    // POST /api/admin/users/{id}/password-setup
    resendPasswordSetup: async (id: number): Promise<void> => {
        await api.post(`/admin/users/${id}/password-setup`);
    },
};
