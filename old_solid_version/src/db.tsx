import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import {
  Component,
  createContext,
  createResource,
  ParentProps,
  Resource,
  useContext,
} from "solid-js";

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

export const DuckDBContext = createContext<Resource<duckdb.AsyncDuckDB>>();

export const DuckDBProvider: Component<ParentProps> = (props) => {
  const [db] = createResource(initDuckDB);

  return (
    <DuckDBContext.Provider value={db}>{props.children}</DuckDBContext.Provider>
  );
};

export function useDuckDB(): Resource<duckdb.AsyncDuckDB> {
  const db = useContext(DuckDBContext);
  if (!db) {
    throw new Error("useDuckDB must be used within a DuckDBProvider");
  }
  return db;
}
