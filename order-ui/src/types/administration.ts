export interface PagedResponse<T> {
    items: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

export interface UserSummary {
    id: number;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserDetail extends UserSummary {
    firstName: string;
    lastName: string;
}

export interface RoleOption {
    id: number;
    name: string;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    sendPasswordSetupEmail?: boolean;
}

export interface UpdateUserRequest {
    email: string;
    firstName?: string;
    lastName?: string;
}

export interface SetUserRoleRequest {
    role: string;
}

export interface UserStatusResponse {
    userId: number;
    active: boolean;
}

export interface AuditEvent {
    id: number;
    type: string;
    actorUserId: number;
    targetUserId?: number;
    metadata: unknown;
    createdAt: string;
}
