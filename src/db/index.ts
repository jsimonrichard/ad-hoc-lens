// Barrel export for db module
export {
  MARKDOWN_MAGIC,
  initDuckDB,
  uploadDataSource,
  deleteDataSource,
} from "./duckdb.js";
export { DuckDBProvider, DuckDBProviderWithSuspense } from "./provider.js";
export { useDuckDB } from "./hooks.js";
export {
  storeFile,
  getFile,
  getAllFiles,
  deleteFile,
  type StoredFile,
} from "./indexeddb.js";
