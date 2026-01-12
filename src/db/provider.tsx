import * as duckdb from "@duckdb/duckdb-wasm";
import React, { use, useMemo } from "react";
import { initDuckDB } from "./duckdb.js";
import { DuckDBContext } from "./context.js";

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
              <div className="mb-4 text-lg">Loading Database...</div>
            </div>
          </div>
        )
      }
    >
      <DuckDBProvider dbPromise={dbPromise}>{children}</DuckDBProvider>
    </React.Suspense>
  );
};
