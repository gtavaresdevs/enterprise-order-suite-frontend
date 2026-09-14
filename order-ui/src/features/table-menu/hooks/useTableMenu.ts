import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tableMenuService } from "../services/tableMenu.service";

export const useTableMenu = () => {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get("table");
    const [activeCategory, setActiveCategory] = useState("All");

    const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
        queryKey: ["publicMenu"],
        queryFn: tableMenuService.getPublicMenu,
    });

    const { data: table = null, isLoading: isTableLoading } = useQuery({
        queryKey: ["tables", tableId],
        queryFn: () => tableMenuService.getTable(tableId as string),
        enabled: !!tableId,
    });

    const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];

    const filteredItems = activeCategory === "All"
        ? menuItems
        : menuItems.filter((item) => item.category === activeCategory);

    return {
        table,
        tableId,
        categories,
        filteredItems,
        activeCategory,
        setActiveCategory,
        isLoading: isMenuLoading || (!!tableId && isTableLoading),
        isTableLoading,
    };
};
