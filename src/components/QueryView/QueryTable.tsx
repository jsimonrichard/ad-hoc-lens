import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { generateColumns } from "@/utils/table-columns";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface QueryTableProps {
  data: Record<string, unknown>[];
  error: string | null;
  isRunning: boolean;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function QueryTable({
  data,
  error,
  isRunning,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: QueryTableProps) {
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => generateColumns(data),
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize) || 1,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  // Generate page options for the dropdown
  const pageOptions = useMemo(() => {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalCount, pageSize]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Results</h3>
        {totalCount > 0 && (
          <div className="text-xs text-muted-foreground">
            {totalCount} row{totalCount !== 1 ? "s" : ""}
            {columns.length > 0 &&
              ` × ${columns.length} column${columns.length !== 1 ? "s" : ""}`}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto min-h-0">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        {data.length === 0 && !error && !isRunning && (
          <div className="p-4 font-mono text-sm text-muted-foreground">
            No results. Run a query to see results here.
          </div>
        )}
        {data.length > 0 && (
          <div className="h-full overflow-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 text-left text-xs font-semibold text-foreground border-b border-r last:border-r-0"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-2 text-xs border-r last:border-r-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                onPageSizeChange(newPageSize);
                onPageChange(0);
              }}
            >
              <SelectTrigger size="sm" className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="250">250</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {pageIndex + 1} of {Math.ceil(totalCount / pageSize) || 1}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(0)}
                disabled={pageIndex === 0}
                title="First page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(pageIndex - 1)}
                disabled={pageIndex === 0}
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(pageIndex + 1)}
                disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onPageChange(Math.ceil(totalCount / pageSize) - 1)
                }
                disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
                title="Last page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Go to:</span>
              <Select
                value={String(pageIndex + 1)}
                onValueChange={(value) => {
                  const pageNumber = parseInt(value, 10);
                  if (!isNaN(pageNumber)) {
                    onPageChange(pageNumber - 1);
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageOptions.map((pageNum) => (
                    <SelectItem key={pageNum} value={String(pageNum)}>
                      {pageNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
