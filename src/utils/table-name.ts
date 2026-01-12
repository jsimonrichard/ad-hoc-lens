/**
 * Helper function to sanitize name for use as SQL table name
 */
export function sanitizeTableName(name: string): string {
  const sanitized = name
    .replace(/-/g, "_") // Replace dashes with underscores first
    .replace(/[^a-zA-Z0-9_]/g, "_") // Replace any other non-alphanumeric characters
    .replace(/_+/g, "_") // Collapse multiple underscores into one
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .toLowerCase();

  // Ensure it starts with a letter or underscore
  const final = sanitized || "table";
  return /^[a-zA-Z_]/.test(final) ? final : `_${final}`;
}
