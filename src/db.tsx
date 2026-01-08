import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import React, { createContext, useContext, use, useMemo } from "react";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

export const MARKDOWN_MAGIC = "?|markdown|?\n";

export async function initDuckDB() {
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  // Instantiate the asynchronous version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  const c = await db.connect();

  // Load the markdown function
  await c.query(
    `CREATE OR REPLACE MACRO md(text) AS concat('${MARKDOWN_MAGIC}', text);`
  );

  // TODO: Rehydrate tables

  await c.close();

  return db;
}

interface DuckDBContextValue {
  db: duckdb.AsyncDuckDB | null;
}

const DuckDBContext = createContext<DuckDBContextValue | null>(null);

// Component that receives the promise and provides the context
// This component will suspend until DB is ready
export const DuckDBProvider: React.FC<{
  children: React.ReactNode;
  dbPromise: Promise<duckdb.AsyncDuckDB>;
}> = ({ children, dbPromise }) => {
  // Use the promise passed from parent - ensures exact same promise reference
  const db = use(dbPromise);

  // Use useMemo to stabilize the context value
  const contextValue = React.useMemo(() => ({ db }), [db]);

  return (
    <DuckDBContext.Provider value={contextValue}>
      {children}
    </DuckDBContext.Provider>
  );
};

// Holistic wrapper component that manages promise creation and Suspense
export const DuckDBProviderWithSuspense: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  // Create the promise once using useMemo - this component is above Suspense
  // so it won't remount when Suspense triggers
  const dbPromise = useMemo(() => {
    return initDuckDB();
  }, []);

  return (
    <React.Suspense
      fallback={
        fallback || (
          <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <div className="text-center">
              <div className="mb-4 text-lg">Loading DuckDB...</div>
            </div>
          </div>
        )
      }
    >
      <DuckDBProvider dbPromise={dbPromise}>{children}</DuckDBProvider>
    </React.Suspense>
  );
};

/**
 * Hook to access DuckDB instance with Suspense support.
 * The provider handles Suspense, so this hook always returns the DB instance.
 * If called before DB is ready, the provider will have already suspended.
 *
 * Usage with Suspense:
 * ```tsx
 * <Suspense fallback={<div>Loading DuckDB...</div>}>
 *   <DuckDBProvider>
 *     <YourComponent />
 *   </DuckDBProvider>
 * </Suspense>
 * ```
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
