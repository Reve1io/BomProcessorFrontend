import { useMemo } from "react";

export function usePagination(data: any[], currentPage: number, rowsPerPage: number) {
    return useMemo(() => {
        const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
        const start = (currentPage - 1) * rowsPerPage;
        return {
            totalPages,
            paginated: data.slice(start, start + rowsPerPage)
        };
    }, [data, currentPage, rowsPerPage]);
}
