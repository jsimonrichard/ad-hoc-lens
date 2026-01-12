import type { ColumnDef } from "@tanstack/react-table";
import { TableCell } from "@/components/QueryView/TableCell";

// Generate columns dynamically based on query results
export function generateColumns(queryResults: any[]): ColumnDef<any>[] {
  if (queryResults.length === 0) return [];

  // Get all unique keys from all rows
  const allKeys = new Set<string>();
  queryResults.forEach((row) => {
    Object.keys(row).forEach((key) => allKeys.add(key));
  });

  const columnKeys = Array.from(allKeys);

  return columnKeys.map((key) => ({
    id: key,
    // Use accessorFn instead of accessorKey because DuckDB may generate column names
    // from expressions (e.g., "md('# ' || item.title)") that contain special characters
    // or are formatted in ways that don't work reliably with TanStack Table's accessorKey.
    // By using accessorFn, we directly access the value from the row object, bypassing
    // any potential key matching issues.
    accessorFn: (row: any) => row[key],
    header: key,
    cell: TableCell,
  }));
}
