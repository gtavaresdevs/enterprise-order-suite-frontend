import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "../services/inventory.service";

export const useInventory = () => {
    const queryClient = useQueryClient();

    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ["products"],
        queryFn: inventoryService.getProducts,
    });

    const createProductMutation = useMutation({
        mutationFn: inventoryService.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: inventoryService.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });

    return {
        products,
        isLoading,
        isError,
        createProduct: createProductMutation.mutate,
        isCreating: createProductMutation.isPending,
        deleteProduct: deleteProductMutation.mutate,
        isDeleting: deleteProductMutation.isPending,
    };
};