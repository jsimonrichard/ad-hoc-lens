import * as duckdb from "@duckdb/duckdb-wasm";
import { useContext } from "react";
import { DuckDBContext } from "./context";

/**
 * Hook to access DuckDB instance with Suspense support.
 * The provider handles Suspense, so this hook always returns the DB instance.
 * If called before DB is ready, the provider will have already suspended.
 */
export function useDuckDB(): duckdb.AsyncDuckDB {
  const context = useContext(DuckDBContext);
  if (!context) {
    throw new Error("useDuckDB must be used within a DuckDBProvider");
  }

  // If DB is ready, return it (provider ensures we only get here when ready)
  if (context.db) {
    return context.db;
  }

  // This should never happen because the provider suspends before rendering children
  throw new Error("DuckDB is not initialized. This should not happen.");
}
