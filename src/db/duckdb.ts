import * as duckdb from "@duckdb/duckdb-wasm";
import { storeFile, getAllFiles, deleteFile, getFile } from "./indexeddb.js";

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

export const MARKDOWN_MAGIC = "?|markdown|?\n";

export async function initDuckDB() {
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: "text/javascript",
    })
  );

  // Instantiate the asynchronous version of DuckDB-Wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  const c = await db.connect();

  // Install and load the SQLite extension
  try {
    await c.query(`INSTALL sqlite;`);
    await c.query(`LOAD sqlite;`);
  } catch (error) {
    console.warn("Failed to install/load SQLite extension:", error);
    // Continue even if extension fails to load
  }

  // Load the markdown function
  await c.query(
    `CREATE OR REPLACE MACRO md(text) AS concat('${MARKDOWN_MAGIC}', text);`
  );

  // Rehydrate tables from IndexedDB
  await rehydrateTables(db);

  await c.close();

  return db;
}

/**
 * Get table names from an attached SQLite database
 * @param db DuckDB instance
 * @param schemaName Name of the attached SQLite database
 * @returns Array of table names
 * @throws Error if no tables are found or if there's an issue querying the database
 */
async function getSQLiteTableNames(
  db: duckdb.AsyncDuckDB,
  schemaName: string
): Promise<string[]> {
  const conn = await db.connect();
  try {
    // Escape schema name for identifier (double quotes)
    const escapedSchemaName = `"${schemaName.replace(/"/g, '""')}"`;

    // Switch to the attached database
    await conn.query(`USE ${escapedSchemaName};`);

    // Get table names using SHOW TABLES
    const result = await conn.query(`SHOW TABLES`);

    // Debug: Log the raw result structure
    console.log("[getSQLiteTableNames] SHOW TABLES result:", {
      numRows: result.numRows,
      schema: result.schema,
      resultType: typeof result,
    });

    const resultArray = result.toArray();
    console.log("[getSQLiteTableNames] Result array:", resultArray);
    console.log(
      "[getSQLiteTableNames] Result array length:",
      resultArray.length
    );

    if (resultArray.length === 0) {
      console.warn(
        "[getSQLiteTableNames] No tables found in SQLite database:",
        schemaName
      );
      // Try to inspect the result structure more
      if (result.numRows > 0) {
        console.log(
          "[getSQLiteTableNames] Result has rows but array is empty, inspecting first row:"
        );
        const firstRow = resultArray[0];
        if (firstRow) {
          console.log("[getSQLiteTableNames] First row:", firstRow);
          console.log(
            "[getSQLiteTableNames] First row toJSON:",
            firstRow.toJSON?.()
          );
        }
      }
      throw new Error(
        `No tables found in SQLite database "${schemaName}". The database may be empty or the attachment failed.`
      );
    }

    // Try to extract table names - check different possible column names
    const tableNames: string[] = [];
    for (const row of resultArray) {
      const json = row.toJSON();
      console.log("[getSQLiteTableNames] Row JSON:", json);

      // SHOW TABLES might return different column names
      const tableName =
        json.name ||
        json.table_name ||
        json.Name ||
        json.Table ||
        Object.values(json)[0];
      if (tableName && typeof tableName === "string") {
        tableNames.push(tableName);
      }
    }

    console.log("[getSQLiteTableNames] Extracted table names:", tableNames);

    if (tableNames.length === 0) {
      throw new Error(
        `Could not extract table names from SQLite database "${schemaName}". The database structure may be unexpected.`
      );
    }

    return tableNames;
  } finally {
    await conn.close();
  }
}

/**
 * Register a file buffer with DuckDB and create a table from it.
 * @param db DuckDB instance
 * @param fileData File data as Uint8Array
 * @param fileName Name to use in DuckDB
 * @param tableName Name of the table to create
 * @returns Object with type information and optional tables/schemaName for SQLite
 */
async function registerFileBufferAndCreateTable(
  db: duckdb.AsyncDuckDB,
  fileData: Uint8Array,
  fileName: string,
  tableName: string
): Promise<{
  type: "sqlite" | "regular";
  tables?: string[];
  schemaName?: string;
}> {
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
      case "txt": {
        // For CSV/TSV files, use read_csv_auto
        const delim = extension === "tsv" ? "E'\\t'" : "','";
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_csv('${escapedFileName}', delim=${delim})
        `;
        break;
      }
      case "json":
      case "jsonl": {
        // For JSON files, use read_json_auto
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_json_auto('${escapedFileName}')
        `;
        break;
      }
      case "parquet": {
        // For Parquet files, use read_parquet
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_parquet('${escapedFileName}')
        `;
        break;
      }
      case "db":
      case "sqlite":
      case "sqlite3": {
        // For SQLite files, attach the database
        // The schema name is based on the table name to avoid conflicts
        const schemaName = tableName.replace(/[^a-zA-Z0-9_]/g, "_");
        const escapedSchemaName = `"${schemaName.replace(/"/g, '""')}"`;
        createTableQuery = `
          ATTACH '${escapedFileName}' AS ${escapedSchemaName} (TYPE sqlite);
        `;
        await conn.query(createTableQuery);

        try {
          // Get table names from the SQLite database
          const tables = await getSQLiteTableNames(db, schemaName);
          return { type: "sqlite", tables, schemaName };
        } catch (error) {
          // If getting table names fails, detach the database to clean up
          try {
            await conn.query(`DETACH DATABASE IF EXISTS ${escapedSchemaName}`);
          } catch (detachError) {
            console.error(
              "Failed to detach SQLite database after error:",
              detachError
            );
          }
          // Re-throw the original error
          throw error;
        }
      }
      default: {
        // Default to CSV for unknown extensions
        createTableQuery = `
          CREATE TABLE ${escapedTableName} AS 
          SELECT * FROM read_csv('${escapedFileName}')
        `;
        break;
      }
    }

    await conn.query(createTableQuery);
    return { type: "regular" as const };
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
      // Rehydrate but don't need to return metadata here
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
 * @returns Promise that resolves with data source metadata (type, tables, schemaName)
 */
export async function uploadDataSource(
  db: duckdb.AsyncDuckDB,
  file: File,
  name: string,
  dataSourceId: string
): Promise<{
  type: "sqlite" | "regular";
  tables?: string[];
  schemaName?: string;
}> {
  // Read file data
  const fileBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(fileBuffer);

  // Store in IndexedDB first
  await storeFile(dataSourceId, file.name, name, fileBuffer);

  try {
    // Register with DuckDB and create table
    const metadata = await registerFileBufferAndCreateTable(
      db,
      fileData,
      file.name,
      name
    );
    return metadata;
  } catch (error) {
    // If table creation fails, remove the file from IndexedDB
    await deleteFile(dataSourceId);
    throw error;
  }
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
  // Get file info first to check if it's a SQLite database
  const storedFile = await getFile(dataSourceId);
  const isSQLite = storedFile
    ? ["db", "sqlite", "sqlite3"].includes(
        storedFile.fileName.split(".").pop()?.toLowerCase() || ""
      )
    : false;

  const conn = await db.connect();
  try {
    if (isSQLite) {
      // For SQLite databases, detach the schema
      const schemaName = name.replace(/[^a-zA-Z0-9_]/g, "_");
      const escapedSchemaName = `"${schemaName.replace(/"/g, '""')}"`;
      await conn.query(`DETACH DATABASE IF EXISTS ${escapedSchemaName}`);
    } else {
      // For other file types, drop the table
      const escapedTableName = `"${name.replace(/"/g, '""')}"`;
      await conn.query(`DROP TABLE IF EXISTS ${escapedTableName}`);
    }
  } finally {
    await conn.close();
  }

  // Delete from IndexedDB
  await deleteFile(dataSourceId);
}
