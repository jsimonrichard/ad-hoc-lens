import * as duckdb from "@duckdb/duckdb-wasm";
import { createContext } from "react";

export interface DuckDBContextValue {
  db: duckdb.AsyncDuckDB | null;
}

export const DuckDBContext = createContext<DuckDBContextValue | null>(null);
