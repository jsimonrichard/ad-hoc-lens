# Ad Hoc Lens

A frontend-only viewer for datasets containing markdown, built on top of [DuckDB](https://duckdb.org/). Ad Hoc Lens lets you explore and query data files directly in your browser using DuckDB-wasm, without any server-side processing.

## Features

- **Local-first**: All data processing happens in your browser using [DuckDB-wasm](https://duckdb.org/). No server required.
- **Multiple formats**: Supports CSV, TSV, JSON, JSONL, and Parquet files.
- **SQL queries**: Write SQL queries to explore your data with syntax highlighting and autocomplete.
- **Markdown rendering**: Special support for rendering markdown content within datasets using the `md()` macro function.
- **Persistent storage**: Data sources and queries are stored locally in IndexedDB, so they persist across sessions.
- **Modern UI**: Built with React, TypeScript, and shadcn/ui with dark mode support.

## Getting Started

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

## Demo

When you first open Ad Hoc Lens, you'll be prompted to start with demo data. Click "Use Demo Values" to load a sample dataset (`rayon-rs__rayon_dataset.jsonl`) with two example queries.

### Example Queries

**1. Select all data:**

```sql
SELECT * FROM rayon_rs_rayon_dataset
```

**2. Render markdown from nested JSON:**

```sql
SELECT md('# ' || item.title || e'\n' || item.body) AS issue
FROM rayon_rs_rayon_dataset, UNNEST(resolved_issues) AS t(item);
```

This query demonstrates how to:

- Unnest nested JSON arrays using `UNNEST()`
- Combine text fields with string concatenation
- Use the `md()` macro to render markdown content (titles and bodies as formatted markdown)

The markdown renderer will display the content with proper formatting, syntax highlighting for code blocks, and all standard markdown features.

## Usage

1. **Add a data source**: Click the "Add Data Source" button in the sidebar and upload a CSV, JSON, JSONL, or Parquet file.
2. **Write queries**: Use SQL to query your data. Reference tables by their data source names.
3. **Render markdown**: Use the `md()` macro function to render markdown content from your dataset:
   ```sql
   SELECT md(content_column) FROM my_table;
   ```
4. **Save queries**: Save frequently used queries for quick access later.

## Tech Stack

- React 19
- TypeScript
- Vite
- [DuckDB-wasm](https://duckdb.org/)
- shadcn/ui
- CodeMirror
- IndexedDB
