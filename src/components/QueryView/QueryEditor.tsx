import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useMemo, useState, useEffect } from "react";
import { createCustomTheme } from "@/utils/codemirror-theme";
import { Info, ExternalLink } from "lucide-react";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  tableNames: string[];
  placeholder?: string;
}

export function QueryEditor({
  value,
  onChange,
  tableNames,
  placeholder = "Write your query here...",
}: QueryEditorProps) {
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

  // Extract table names from data sources and create SQL extension with autocomplete
  const sqlExtension = useMemo(() => {
    return sql({
      schema: tableNames,
    });
  }, [tableNames]);

  return (
    <div className="relative h-full w-full">
      <CodeMirror
        value={value}
        height="100%"
        extensions={[sqlExtension]}
        onChange={onChange}
        placeholder={placeholder}
        theme={customTheme}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
        }}
        className="h-full w-full"
      />
      <a
        href="https://duckdb.org/docs/stable/sql/introduction"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md shadow-lg hover:bg-muted transition-colors text-xs text-foreground no-underline z-10"
        title="DuckDB SQL Documentation"
      >
        <Info className="w-4 h-4" />
        <span>DuckDB SQL Docs</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
