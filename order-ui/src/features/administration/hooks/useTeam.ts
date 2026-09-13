import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "../services/team.service";
import type { CreateUserRequest, UpdateUserRequest, SetUserRoleRequest } from "@/types/administration";

export const PAGE_SIZE = 20;

export function useTeam(page: number) {
    const queryClient = useQueryClient();
    const queryKey = ["users", page, PAGE_SIZE] as const;

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => teamService.listUsers(page, PAGE_SIZE),
    });

    const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["users"] });

    const inviteMutation = useMutation({
        mutationFn: (request: CreateUserRequest) => teamService.inviteUser(request),
        onSuccess: invalidateUsers,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, request }: { id: number; request: UpdateUserRequest }) =>
            teamService.updateUser(id, request),
        onSuccess: invalidateUsers,
    });

    const setRoleMutation = useMutation({
        mutationFn: ({ id, request }: { id: number; request: SetUserRoleRequest }) =>
            teamService.setUserRole(id, request),
        onSuccess: invalidateUsers,
    });

    const deactivateMutation = useMutation({
        mutationFn: (id: number) => teamService.deactivateUser(id),
        onSuccess: invalidateUsers,
    });

    const reactivateMutation = useMutation({
        mutationFn: (id: number) => teamService.reactivateUser(id),
        onSuccess: invalidateUsers,
    });

    const resendSetupMutation = useMutation({
        mutationFn: (id: number) => teamService.resendPasswordSetup(id),
    });

    return {
        data,
        isLoading,
        isError,
        invite: inviteMutation.mutateAsync,
        isInviting: inviteMutation.isPending,
        update: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        setRole: setRoleMutation.mutateAsync,
        isSettingRole: setRoleMutation.isPending,
        deactivate: deactivateMutation.mutate,
        isDeactivating: deactivateMutation.isPending,
        reactivate: reactivateMutation.mutate,
        isReactivating: reactivateMutation.isPending,
        resendSetup: resendSetupMutation.mutate,
        isResendingSetup: resendSetupMutation.isPending,
    };
}
