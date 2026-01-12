import type { CellContext } from "@tanstack/react-table";
import { MARKDOWN_MAGIC } from "@/db";
import { MarkdownRenderer } from "./MarkdownRenderer";

export function TableCell({ getValue }: CellContext<any, unknown>) {
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
}
