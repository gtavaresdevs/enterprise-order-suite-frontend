import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesService } from "../services/tables.service";

export const useTables = () => {
    const queryClient = useQueryClient();

    const { data: tables = [], isLoading, isError } = useQuery({
        queryKey: ["tables"],
        queryFn: tablesService.getTables,
    });

    const createMutation = useMutation({
        mutationFn: tablesService.createTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: tablesService.deleteTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
        },
    });

    return {
        tables,
        isLoading,
        isError,
        createTable: createMutation.mutate,
        isCreating: createMutation.isPending,
        deleteTable: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};
