import type { Table } from "@/types/tables";
import { TABLES } from "../constants/tables.constants";

let tables: Table[] = [...TABLES];

export const tablesService = {
    getTables: async (): Promise<Table[]> => {
        // TODO: connect-backend — GET /api/v1/tables
        return new Promise((resolve) => setTimeout(() => resolve([...tables]), 300));
    },

    createTable: async (name: string): Promise<Table> => {
        // TODO: connect-backend — POST /api/v1/tables
        return new Promise((resolve) => {
            const id = `t-${Math.random().toString(36).slice(2, 9)}`;
            const newTable: Table = { id, name, qrCodeUrl: `/storefront?table=${id}` };
            tables = [...tables, newTable];
            setTimeout(() => resolve(newTable), 400);
        });
    },

    deleteTable: async (id: string): Promise<void> => {
        // TODO: connect-backend — DELETE /api/v1/tables/{id}
        return new Promise((resolve) => {
            tables = tables.filter((t) => t.id !== id);
            setTimeout(resolve, 300);
        });
    },
};
