import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import React, { createContext, useContext, use, useMemo } from "react";
import { storeFile, getAllFiles, deleteFile } from "./db/indexeddb.js";

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

  // Rehydrate tables from IndexedDB
  await rehydrateTables(db);

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

/**
 * Register a file buffer with DuckDB and create a table from it.
 * @param db DuckDB instance
 * @param fileData File data as Uint8Array
 * @param fileName Name to use in DuckDB
 * @param tableName Name of the table to create
 */
async function registerFileBufferAndCreateTable(
  db: duckdb.AsyncDuckDB,
  fileData: Uint8Array,
  fileName: string,
  tableName: string
): Promise<void> {
  // Register the file with DuckDB
  await db.registerFileBuffer(fileName, fileData);

  // Determine file extension to choose the right read function
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  const conn = await db.connect();

  try {
    // Create table based on file type
    let createTableQuery: string;

    // Escape table name and file name for SQL (double quotes for identifiers, single quotes for strings)
    const escapedTableName = `"${tableName.replace(/"/g, '""')}"`;
    const escapedFileName = fileName.replace(/'/g, "''");

    switch (extension) {
      case "csv":
      case "tsv":
      case "txt":
        // For CSV/TSV files, use read_csv_auto
        const delimiter = extension === "tsv" ? "E'\\t'" : "','";
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_csv_auto('${escapedFileName}', delimiter=${delimiter})
        `;
        break;
      case "json":
      case "jsonl":
        // For JSON files, use read_json_auto
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_json_auto('${escapedFileName}')
        `;
        break;
      case "parquet":
        // For Parquet files, use read_parquet
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_parquet('${escapedFileName}')
        `;
        break;
      default:
        // Default to CSV for unknown extensions
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_csv_auto('${escapedFileName}')
        `;
    }

    await conn.query(createTableQuery);
  } finally {
    await conn.close();
  }
}

/**
 * Rehydrate tables from IndexedDB into DuckDB
 */
async function rehydrateTables(db: duckdb.AsyncDuckDB): Promise<void> {
  try {
    const storedFiles = await getAllFiles();
    for (const storedFile of storedFiles) {
      const fileData = new Uint8Array(storedFile.data);
      await registerFileBufferAndCreateTable(
        db,
        fileData,
        storedFile.fileName,
        storedFile.tableName
      );
    }
  } catch (error) {
    console.error("Failed to rehydrate tables from IndexedDB:", error);
    // Don't throw - allow app to continue even if rehydration fails
  }
}

/**
 * Unified function to upload a data source: stores in IndexedDB and registers with DuckDB.
 * This is the main function the UI should call when uploading a data source.
 * @param db DuckDB instance
 * @param file File to upload
 * @param name Display name for the data source (will be sanitized for table name)
 * @param dataSourceId Unique ID for the data source
 * @returns Promise that resolves when upload is complete
 */
export async function uploadDataSource(
  db: duckdb.AsyncDuckDB,
  file: File,
  name: string,
  dataSourceId: string
): Promise<void> {
  // Read file data
  const fileBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(fileBuffer);

  // Store in IndexedDB first
  await storeFile(dataSourceId, file.name, name, fileBuffer);

  // Register with DuckDB and create table
  await registerFileBufferAndCreateTable(db, fileData, file.name, name);
}

/**
 * Delete a data source: removes from IndexedDB and drops table from DuckDB.
 * @param db DuckDB instance
 * @param dataSourceId Unique ID for the data source
 * @param name Display name (will be sanitized to get table name)
 */
export async function deleteDataSource(
  db: duckdb.AsyncDuckDB,
  dataSourceId: string,
  name: string
): Promise<void> {
  // Delete from IndexedDB
  await deleteFile(dataSourceId);

  // Drop table from DuckDB
  const conn = await db.connect();
  try {
    const escapedTableName = `"${name.replace(/"/g, '""')}"`;
    await conn.query(`DROP TABLE IF EXISTS ${escapedTableName}`);
  } finally {
    await conn.close();
  }
}
