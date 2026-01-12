import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useState, useEffect, useRef, useCallback } from "react";

type ArrowTable = Awaited<ReturnType<AsyncDuckDBConnection["query"]>>;

interface UseArrowTablePaginationOptions {
  defaultPageSize?: number;
  queryContent?: string;
}

interface UseArrowTablePaginationReturn {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: Record<string, unknown>[];
  setArrowTable: (arrowTable: ArrowTable) => void;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

export function useArrowTablePagination({
  defaultPageSize = 50,
  queryContent,
}: UseArrowTablePaginationOptions = {}): UseArrowTablePaginationReturn {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrowTableRef = useRef<any>(null);

  // Fetch current page when pagination changes
  const fetchCurrentPage = useCallback(() => {
    if (!arrowTableRef.current) return;

    const arrowTable = arrowTableRef.current;
    const offset = pageIndex * pageSize;
    const end = Math.min(offset + pageSize, arrowTable.numRows);

    // Use Arrow table slicing to get only the current page (this is a view, not a copy!)
    const slicedTable = arrowTable.slice(offset, end);
    const resultArray = slicedTable.toArray();

    // Use toJSON() on each row to properly serialize all DuckDB types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = resultArray.map((row: any) => row.toJSON()) as Record<
      string,
      unknown
    >[];

    setData(serialized);
  }, [pageIndex, pageSize]);

  // Update displayed page when pagination changes
  useEffect(() => {
    if (arrowTableRef.current && totalCount > 0) {
      fetchCurrentPage();
    }
  }, [fetchCurrentPage, totalCount]);

  // Reset pagination when query changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPageIndex(0);
      setTotalCount(0);
      setData([]);
      arrowTableRef.current = null;
    }, 0);
    return () => clearTimeout(timeout);
  }, [queryContent]);

  const setArrowTable = useCallback((arrowTable: ArrowTable) => {
    arrowTableRef.current = arrowTable;
    const total = arrowTable.numRows;
    setTotalCount(total);
    setPageIndex(0);
  }, []);

  const reset = useCallback(() => {
    setPageIndex(0);
    setTotalCount(0);
    setData([]);
    arrowTableRef.current = null;
  }, []);

  return {
    pageIndex,
    pageSize,
    totalCount,
    data,
    setArrowTable,
    setPageIndex,
    setPageSize,
    reset,
  };
}
