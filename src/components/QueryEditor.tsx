import { Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useQuery, useUpdateQuery } from "@/store/queries";
import { useDataSources } from "@/store/dataSources";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { useMemo, useState, useEffect } from "react";
import { useDuckDB, MARKDOWN_MAGIC } from "@/db";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStarryNight from "rehype-starry-night";
import rehypeReact from "rehype-react";
import { createElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type CellContext,
} from "@tanstack/react-table";

// Function to get CSS variable value
function getCSSVariable(variable: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

// Create custom theme using Tailwind colors
function createCustomTheme() {
  const isDark = document.documentElement.classList.contains("dark");

  // Get color values from CSS variables
  const card = getCSSVariable("--color-card");
  const cardForeground = getCSSVariable("--color-card-foreground");
  const primary = getCSSVariable("--color-primary");
  const muted = getCSSVariable("--color-muted");
  const mutedForeground = getCSSVariable("--color-muted-foreground");
  const foreground = getCSSVariable("--color-foreground");

  // Complementary colors from chart palette
  const chart1 = getCSSVariable("--color-chart-1");
  const chart2 = getCSSVariable("--color-chart-2");
  const chart3 = getCSSVariable("--color-chart-3");
  const chart4 = getCSSVariable("--color-chart-4");
  const chart5 = getCSSVariable("--color-chart-5");
  const ring = getCSSVariable("--color-ring");

  return createTheme({
    theme: isDark ? "dark" : "light",
    settings: {
      background: card,
      foreground: cardForeground,
      caret: primary,
      selection: `${primary}26`, // 15% opacity
      selectionMatch: `${primary}26`,
      lineHighlight: `${muted}4d`, // 30% opacity
      gutterBackground: muted,
      gutterForeground: mutedForeground,
    },
    styles: [
      // Comments - muted gray
      { tag: t.comment, color: mutedForeground },

      // Keywords (SELECT, FROM, WHERE, etc.) - primary color
      { tag: t.keyword, color: primary },

      // Strings - chart-2 (complementary green)
      { tag: [t.string, t.special(t.brace)], color: chart2 },

      // Numbers - chart-1 (lighter complementary)
      { tag: t.number, color: chart1 },

      // Booleans and null - chart-3
      { tag: t.bool, color: chart3 },
      { tag: t.null, color: chart3 },

      // Operators - ring color (neutral gray)
      { tag: t.operator, color: ring },

      // Functions - chart-4 (darker complementary)
      { tag: t.function(t.variableName), color: chart4 },

      // Type names and class names - chart-5 (darkest complementary)
      { tag: t.typeName, color: chart5 },
      { tag: t.className, color: chart5 },
      { tag: t.definition(t.typeName), color: chart5 },

      // Variables and identifiers - foreground (default text color)
      { tag: t.variableName, color: foreground },
      { tag: t.attributeName, color: foreground },
      { tag: t.tagName, color: foreground },
    ],
  });
}

// Component to render markdown with syntax highlighting
function MarkdownRenderer({ content }: { content: string }) {
  const [isDark, setIsDark] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );
  const [rendered, setRendered] = useState<React.ReactElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Process markdown asynchronously
  useEffect(() => {
    let cancelled = false;
    setIsProcessing(true);

    // Create processor with theme-aware syntax highlighting
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStarryNight, {
        theme: isDark ? "github-dark" : "github-light",
      })
      .use(rehypeReact, { createElement, Fragment, jsx, jsxs });

    processor
      .process(content)
      .then((result: any) => {
        if (!cancelled) {
          setRendered(result.result as React.ReactElement);
          setIsProcessing(false);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("Markdown rendering error:", error);
          setRendered(
            <span className="text-destructive">Error rendering markdown</span>
          );
          setIsProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [content, isDark]);

  if (isProcessing && rendered === null) {
    return <span className="text-muted-foreground">Rendering...</span>;
  }

  return <>{rendered}</>;
}

interface QueryEditorProps {
  queryId: string;
  onSave: () => void;
}

export function QueryEditor({ queryId, onSave }: QueryEditorProps) {
  const query = useQuery(queryId);
  const updateQuery = useUpdateQuery();
  const db = useDuckDB();
  const dataSources = useDataSources();
  const [isDark, setIsDark] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Create theme that updates based on current CSS variables and theme
  const customTheme = useMemo(() => createCustomTheme(), [isDark]);

  // Extract table names from data sources and create SQL extension with autocomplete
  const sqlExtension = useMemo(() => {
    const tableNames = Object.values(dataSources).map((ds) => ds.name);
    return sql({
      schema: tableNames,
    });
  }, [dataSources]);

  const handleRunQuery = async () => {
    const queryContent = query?.content?.trim();
    if (!queryContent) {
      console.log("No query to run");
      return;
    }

    setIsRunning(true);
    setQueryError(null);
    setQueryResults([]);

    try {
      const conn = await db.connect();
      try {
        const result = await conn.query(queryContent);
        // DuckDB-wasm returns Arrow tables. Use each row's toJSON() method
        // to properly serialize all data types (dates, timestamps, etc.)
        const arrowTable = result;
        const resultArray = arrowTable.toArray();

        // Use toJSON() on each row to properly serialize all DuckDB types
        const serialized = resultArray.map((row: any) => row.toJSON());

        setQueryResults(serialized);
      } finally {
        await conn.close();
      }
    } catch (error) {
      console.error("Query execution error:", error);
      setQueryError(
        error instanceof Error
          ? error.message
          : "An error occurred while executing the query"
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Generate columns dynamically based on query results
  const columns = useMemo<ColumnDef<any>[]>(() => {
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
      cell: ({ getValue }: CellContext<any, unknown>) => {
        const value = getValue();
        // Handle null/undefined values
        if (value === null || value === undefined) {
          return <span className="text-muted-foreground">null</span>;
        }
        // Convert to string (row.toJSON() already handled BigInt serialization)
        // Use String() instead of JSON.stringify to avoid BigInt serialization errors
        const stringValue = String(value);

        // Check if this is markdown content (starts with markdown magic string)
        if (stringValue.startsWith(MARKDOWN_MAGIC)) {
          const markdownContent = stringValue.slice(MARKDOWN_MAGIC.length);
          return (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer content={markdownContent} />
            </div>
          );
        }

        // Regular text display
        if (stringValue.length > 100) {
          return (
            <span className="font-mono text-xs" title={stringValue}>
              {stringValue.substring(0, 100)}...
            </span>
          );
        }
        return <span className="font-mono text-xs">{stringValue}</span>;
      },
    }));
  }, [queryResults]);

  const table = useReactTable({
    data: queryResults,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TabsContent value={queryId} className="bg-background h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onSave}
          title="Save query (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={handleRunQuery}
          disabled={isRunning}
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
      {/* Flex Layout: Editor and Results */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Editor Section */}
        <div className="border-b overflow-auto flex flex-col h-[40%] shrink-0">
          <CodeMirror
            value={query?.content || ""}
            height="100%"
            extensions={[sqlExtension]}
            onChange={(value) => updateQuery(queryId, { content: value })}
            placeholder="Write your query here..."
            theme={customTheme}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
            }}
            className="h-full w-full"
          />
        </div>
        {/* Results Section */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">Results</h3>
            {queryResults.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {queryResults.length} row{queryResults.length !== 1 ? "s" : ""}
                {columns.length > 0 &&
                  ` × ${columns.length} column${
                    columns.length !== 1 ? "s" : ""
                  }`}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            {queryError && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm">
                <strong>Error:</strong> {queryError}
              </div>
            )}
            {queryResults.length === 0 && !queryError && !isRunning && (
              <div className="p-4 font-mono text-sm text-muted-foreground">
                No results. Run a query to see results here.
              </div>
            )}
            {queryResults.length > 0 && (
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
      </div>
    </TabsContent>
  );
}
