import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useMemo, useState, useEffect } from "react";
import { createCustomTheme } from "@/utils/codemirror-theme";

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
  );
}
