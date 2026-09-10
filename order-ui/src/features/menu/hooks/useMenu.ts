import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../services/menu.service";

export const useMenu = () => {
    const queryClient = useQueryClient();

    const { data: menuItems = [], isLoading, isError } = useQuery({
        queryKey: ["menuItems"],
        queryFn: menuService.getMenuItems,
    });

    const createMutation = useMutation({
        mutationFn: menuService.createMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menuItems"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: menuService.updateMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menuItems"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: menuService.deleteMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menuItems"] });
        },
    });

    return {
        menuItems,
        isLoading,
        isError,
        createMenuItem: createMutation.mutate,
        isCreating: createMutation.isPending,
        updateMenuItem: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteMenuItem: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};
