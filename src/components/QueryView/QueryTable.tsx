import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { generateColumns } from "@/utils/table-columns";
import type { ColumnDef } from "@tanstack/react-table";

interface QueryTableProps {
  data: any[];
  error: string | null;
  isRunning: boolean;
}

export function QueryTable({ data, error, isRunning }: QueryTableProps) {
  const columns = useMemo<ColumnDef<any>[]>(
    () => generateColumns(data),
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Results</h3>
        {data.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {data.length} row{data.length !== 1 ? "s" : ""}
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
    </div>
  );
}
