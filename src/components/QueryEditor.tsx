import { Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useQuery, useUpdateQuery } from "@/store/queries";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { useMemo, useState, useEffect } from "react";
import { useDuckDB } from "@/db";

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

interface QueryEditorProps {
  queryId: string;
  onSave: () => void;
}

export function QueryEditor({ queryId, onSave }: QueryEditorProps) {
  const query = useQuery(queryId);
  const updateQuery = useUpdateQuery();
  const db = useDuckDB();
  const [isDark, setIsDark] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

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

  const handleRunQuery = async () => {
    const queryContent = query?.content?.trim();
    if (!queryContent) {
      console.log("No query to run");
      return;
    }

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

        console.log("Query result:", serialized);
      } finally {
        await conn.close();
      }
    } catch (error) {
      console.error("Query execution error:", error);
    }
  };

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
        >
          <Play className="w-4 h-4" />
          Run
        </Button>
      </div>
      <div className="border overflow-auto h-64 flex flex-col">
        <CodeMirror
          value={query?.content || ""}
          height="100%"
          extensions={[sql()]}
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
      <div className="mt-4 border rounded-lg p-4 bg-card">
        <h3 className="text-md font-semibold mb-2">Output</h3>
        <div className="rounded-md p-3 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
          Rendered markdown or JSON output will appear here.
        </div>
      </div>
    </TabsContent>
  );
}
