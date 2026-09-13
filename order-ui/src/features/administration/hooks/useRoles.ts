import { useQuery } from "@tanstack/react-query";
import { rolesService } from "../services/roles.service";

export function useRoles() {
    const { data: roles = [], isLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: rolesService.listRoles,
    });

    return { roles, isLoading };
}
